import { blocks, geo, presence, profiles, trails } from "@patika/db";
import {
  COARSE_LOCATION_CELL_M,
  coarsen,
  lonLatSchema,
  NEARBY_RADIUS_M,
  PRESENCE_TTL_SECONDS,
} from "@patika/shared";
import { and, eq, gt, ne, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";
import type { AppContext } from "../context";
import { authPlugin } from "../plugins/auth";

function isNightLocal(): boolean {
  // Rota Türkiye'de; UTC+3 sabit (yaz saati yok).
  const h = (new Date().getUTCHours() + 3) % 24;
  return h >= 21 || h < 7;
}

/**
 * Canlı harita varlığı. Yalnız çevrimiçiyken anlamlıdır.
 * - Konum sunucuya ham gelir, kabalaştırılarak saklanır; ham değer hiçbir yere yazılmaz.
 * - Görünürlük profil tercihine bağlı; gece gizleme sunucuda uygulanır.
 */
export const presenceModule = (ctx: AppContext) =>
  new Elysia({ prefix: "/presence" })
    .use(authPlugin(ctx))
    .put(
      "/",
      async ({ user, body, status }) => {
        const [t] = await ctx.db
          .select({ id: trails.id })
          .from(trails)
          .where(eq(trails.slug, body.trail));
        if (!t) return status(404, { error: "trail_not_found" });
        const coarse = coarsen(body.location, COARSE_LOCATION_CELL_M);
        const expiresAt = new Date(Date.now() + PRESENCE_TTL_SECONDS * 1000);
        await ctx.db
          .insert(presence)
          .values({
            userId: user.id,
            trailId: t.id,
            stageId: body.stageId ?? null,
            geomCoarse: coarse,
            expiresAt,
          })
          .onConflictDoUpdate({
            target: presence.userId,
            set: {
              trailId: t.id,
              stageId: body.stageId ?? null,
              geomCoarse: coarse,
              updatedAt: sql`now()`,
              expiresAt,
            },
          });
        return { ok: true, expiresAt };
      },
      {
        auth: true,
        body: z.object({
          trail: z.string(),
          location: lonLatSchema,
          stageId: z.string().length(26).optional(),
        }),
      },
    )
    .delete(
      "/",
      async ({ user }) => {
        await ctx.db.delete(presence).where(eq(presence.userId, user.id));
        return { ok: true };
      },
      { auth: true },
    )
    /** Yakındaki aktif yürüyüşçüler: sayı ve kaba konumlar. Kendisi ve engellediği/engellendiği kişiler hariç. */
    .get(
      "/nearby",
      async ({ user, query }) => {
        const [me] = await ctx.db
          .select({ visibility: profiles.visibility })
          .from(profiles)
          .where(eq(profiles.userId, user.id));
        const night = isNightLocal();
        const rows = await ctx.db
          .select({
            userId: presence.userId,
            geomCoarse: presence.geomCoarse,
            stageId: presence.stageId,
            updatedAt: presence.updatedAt,
            nickname: profiles.nickname,
            avatarKey: profiles.avatarKey,
            visibility: profiles.visibility,
            distanceM: geo.distanceM(presence.geomCoarse, query.lon, query.lat),
          })
          .from(presence)
          .innerJoin(profiles, eq(profiles.userId, presence.userId))
          .where(
            and(
              ne(presence.userId, user.id),
              gt(presence.expiresAt, new Date()),
              geo.dwithin(presence.geomCoarse, query.lon, query.lat, query.radiusM),
              sql`not exists (select 1 from ${blocks} b where (b.blocker_id = ${user.id} and b.blocked_id = ${presence.userId}) or (b.blocker_id = ${presence.userId} and b.blocked_id = ${user.id}))`,
            ),
          )
          .orderBy(sql`1`)
          .limit(100);
        const visible = rows.filter((r) => {
          const v = r.visibility;
          if (!v.shareLocation) return false;
          if (v.hideAtNight && night) return false;
          // womenOnly: karşılıklı tercih çemberi (cinsiyet doğrulaması yoktur; dürüst bir kulüp modeli).
          if (v.womenOnly && !me?.visibility.womenOnly) return false;
          return true;
        });
        return {
          count: visible.length,
          hikers: visible.map((r) => ({
            userId: r.userId,
            nickname: r.nickname,
            avatarKey: r.avatarKey,
            location: r.geomCoarse,
            stageId: r.stageId,
            distanceM: Math.round(Number(r.distanceM)),
            updatedAt: r.updatedAt,
          })),
        };
      },
      {
        auth: true,
        query: z.object({
          lon: z.coerce.number(),
          lat: z.coerce.number(),
          radiusM: z.coerce.number().min(500).max(50_000).default(NEARBY_RADIUS_M),
        }),
      },
    );
