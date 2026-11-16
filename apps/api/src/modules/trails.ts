import { geo, pois, stages, trails } from "@patika/db";
import { POI_TYPES } from "@patika/shared";
import { and, asc, eq, gt, isNull, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";
import type { AppContext } from "../context";

/** Rota, etap ve POI okuma uçları. Hepsi herkese açık (okuma).
 *  Mobil, çevrimdışı paket için /trails/:slug/pack ile tam veriyi alır. */
export const trailsModule = (ctx: AppContext) =>
  new Elysia({ prefix: "/trails" })
    .get("/", async () => {
      return ctx.db
        .select({
          id: trails.id,
          slug: trails.slug,
          name: trails.name,
          dataVersion: trails.dataVersion,
          lengthM: trails.lengthM,
          bbox: trails.bbox,
        })
        .from(trails)
        .where(eq(trails.isActive, true));
    })
    .get("/:slug", async ({ params, status }) => {
      const [t] = await ctx.db.select().from(trails).where(eq(trails.slug, params.slug));
      if (!t) return status(404, { error: "trail_not_found" });
      const st = await ctx.db
        .select({
          id: stages.id,
          seq: stages.seq,
          name: stages.name,
          distanceM: stages.distanceM,
          ascentM: stages.ascentM,
          descentM: stages.descentM,
          cumStartM: stages.cumStartM,
          notes: stages.notes,
        })
        .from(stages)
        .where(eq(stages.trailId, t.id))
        .orderBy(asc(stages.seq));
      return { ...t, stages: st };
    })
    /** Etap geometrileri GeoJSON olarak (çevrimdışı paket ve harita katmanı). */
    .get("/:slug/stages.geojson", async ({ params, status }) => {
      const [t] = await ctx.db
        .select({ id: trails.id })
        .from(trails)
        .where(eq(trails.slug, params.slug));
      if (!t) return status(404, { error: "trail_not_found" });
      const rows = await ctx.db
        .select({
          id: stages.id,
          seq: stages.seq,
          name: stages.name,
          distanceM: stages.distanceM,
          cumStartM: stages.cumStartM,
          geojson: geo.asGeoJson(stages.track),
        })
        .from(stages)
        .where(eq(stages.trailId, t.id))
        .orderBy(asc(stages.seq));
      return {
        type: "FeatureCollection",
        features: rows.map((r) => ({
          type: "Feature",
          id: r.id,
          properties: { seq: r.seq, name: r.name, distanceM: r.distanceM, cumStartM: r.cumStartM },
          geometry: JSON.parse(r.geojson),
        })),
      };
    })
    /** POI listesi; `since` verilirse yalnız o tarihten sonra değişenler (delta). */
    .get(
      "/:slug/pois",
      async ({ params, query, status }) => {
        const [t] = await ctx.db
          .select({ id: trails.id })
          .from(trails)
          .where(eq(trails.slug, params.slug));
        if (!t) return status(404, { error: "trail_not_found" });
        const conds = [eq(pois.trailId, t.id), eq(pois.isPublished, true)];
        if (query.type) conds.push(eq(pois.type, query.type));
        if (query.since) conds.push(gt(pois.updatedAt, new Date(query.since)));
        else conds.push(isNull(pois.deletedAt));
        const rows = await ctx.db
          .select({
            id: pois.id,
            type: pois.type,
            name: pois.name,
            description: pois.description,
            geom: pois.geom,
            stageId: pois.stageId,
            trailOffsetM: pois.trailOffsetM,
            distanceFromTrackM: pois.distanceFromTrackM,
            isPaid: pois.isPaid,
            seasonality: pois.seasonality,
            contact: pois.contact,
            derived: pois.derived,
            updatedAt: pois.updatedAt,
            deletedAt: pois.deletedAt,
          })
          .from(pois)
          .where(and(...conds))
          .orderBy(asc(pois.trailOffsetM));
        return { pois: rows, serverTime: new Date().toISOString() };
      },
      {
        query: z.object({
          type: z.enum(POI_TYPES).optional(),
          since: z.iso.datetime({ offset: true }).optional(),
        }),
      },
    )
    /** Rota üzerinde bir konumdan ileriye doğru en yakın POI'ler ("sonraki su 3,4 km"). */
    .get(
      "/:slug/next",
      async ({ params, query, status }) => {
        const [t] = await ctx.db
          .select({ id: trails.id })
          .from(trails)
          .where(eq(trails.slug, params.slug));
        if (!t) return status(404, { error: "trail_not_found" });
        const rows = await ctx.db
          .select({
            id: pois.id,
            type: pois.type,
            name: pois.name,
            trailOffsetM: pois.trailOffsetM,
            derived: pois.derived,
          })
          .from(pois)
          .where(
            and(
              eq(pois.trailId, t.id),
              eq(pois.isPublished, true),
              isNull(pois.deletedAt),
              gt(pois.trailOffsetM, query.offsetM),
              query.type ? eq(pois.type, query.type) : sql`true`,
            ),
          )
          .orderBy(asc(pois.trailOffsetM))
          .limit(query.limit);
        return rows.map((r) => ({ ...r, aheadM: (r.trailOffsetM ?? 0) - query.offsetM }));
      },
      {
        query: z.object({
          offsetM: z.coerce.number().min(0),
          type: z.enum(POI_TYPES).optional(),
          limit: z.coerce.number().int().min(1).max(20).default(5),
        }),
      },
    )
    /** Çevrimdışı paket bildirimi: harita karoları, etaplar, POI'ler nereden indirilir. */
    .get("/:slug/pack", async ({ params, status }) => {
      const [t] = await ctx.db.select().from(trails).where(eq(trails.slug, params.slug));
      if (!t) return status(404, { error: "trail_not_found" });
      return {
        slug: t.slug,
        dataVersion: t.dataVersion,
        bbox: t.bbox,
        tiles: {
          style: `${ctx.env.TILES_BASE_URL}/styles/${t.slug}.json`,
          pmtiles: `${ctx.env.TILES_BASE_URL}/${t.slug}.pmtiles`,
        },
        stagesUrl: `/trails/${t.slug}/stages.geojson`,
        poisUrl: `/trails/${t.slug}/pois`,
      };
    });
