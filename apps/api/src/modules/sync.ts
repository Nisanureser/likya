import { hikes, needs, pois, profiles, syncCursors, syncLog, trails } from "@patika/db";
import {
  hikeSchema,
  lastKnownSchema,
  needCreateSchema,
  type OutboxItem,
  offerCreateSchema,
  poiReportSchema,
  poiSuggestionSchema,
  profileSchema,
  type SyncPushResponse,
  syncPullRequestSchema,
  syncPushRequestSchema,
} from "@patika/shared";
import { and, eq, gt, inArray, or, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";
import type { AppContext } from "../context";
import { authPlugin } from "../plugins/auth";
import { upsertHike, upsertLastKnown } from "../services/hikes";
import { createNeed, createOffer, NeedError } from "../services/needs";
import { addPoiReport, addPoiSuggestion } from "../services/reports";

type Result = SyncPushResponse["results"][number];

/**
 * Outbox işleme. Her kayıt bağımsız işlenir; biri reddedilince diğerleri devam eder.
 * Aynı (itemId, version) ikinci kez gelirse sync_log'dan önceki sonuç döner (idempotent).
 */
async function applyItem(ctx: AppContext, userId: string, item: OutboxItem): Promise<Result> {
  const device = new Date(item.deviceUpdatedAt);
  try {
    switch (item.entity) {
      case "poi_report": {
        const p = poiReportSchema.parse({ ...item.payload, id: item.id });
        const r = await addPoiReport(ctx.db, userId, p, device);
        return r.applied
          ? { id: item.id, status: "applied" }
          : r.reason === "duplicate"
            ? { id: item.id, status: "applied" }
            : { id: item.id, status: "rejected", reason: r.reason };
      }
      case "poi_suggestion": {
        const p = poiSuggestionSchema.parse({ ...item.payload, id: item.id });
        const r = await addPoiSuggestion(ctx.db, userId, p, device);
        return r.applied || r.reason === "duplicate"
          ? { id: item.id, status: "applied" }
          : { id: item.id, status: "rejected", reason: r.reason };
      }
      case "need": {
        const p = needCreateSchema.parse({
          ...item.payload,
          id: item.id,
          deviceCreatedAt: item.payload.deviceCreatedAt ?? item.deviceUpdatedAt,
        });
        await createNeed(ctx.db, userId, p);
        return { id: item.id, status: "applied" };
      }
      case "need_offer": {
        const p = offerCreateSchema.parse({
          ...item.payload,
          id: item.id,
          deviceCreatedAt: item.payload.deviceCreatedAt ?? item.deviceUpdatedAt,
        });
        await createOffer(ctx.db, userId, p);
        return { id: item.id, status: "applied" };
      }
      case "hike": {
        const p = hikeSchema.parse({ ...item.payload, id: item.id, version: item.version });
        const r = await upsertHike(ctx.db, userId, p);
        return r.applied
          ? { id: item.id, status: "applied", version: r.version }
          : { id: item.id, status: "ignored_stale", version: r.version };
      }
      case "profile": {
        const p = profileSchema.parse(item.payload);
        const [existing] = await ctx.db
          .select({ version: profiles.version })
          .from(profiles)
          .where(eq(profiles.userId, userId));
        if (existing && item.version < existing.version)
          return { id: item.id, status: "ignored_stale", version: existing.version };
        await ctx.db
          .insert(profiles)
          .values({ userId, ...p, version: item.version })
          .onConflictDoUpdate({
            target: profiles.userId,
            set: { ...p, version: item.version, updatedAt: sql`now()` },
          });
        return { id: item.id, status: "applied", version: item.version };
      }
      case "last_known": {
        const p = lastKnownSchema.parse(item.payload);
        const r = await upsertLastKnown(ctx.db, userId, p);
        return { id: item.id, status: r.applied ? "applied" : "ignored_stale" };
      }
    }
  } catch (e) {
    if (e instanceof NeedError) return { id: item.id, status: "rejected", reason: e.code };
    if (e instanceof z.ZodError)
      return {
        id: item.id,
        status: "rejected",
        reason: `validation: ${e.issues.map((i) => i.path.join(".")).join(",")}`,
      };
    if (e instanceof Error)
      return { id: item.id, status: "rejected", reason: e.message.slice(0, 200) };
    throw e;
  }
}

export const syncModule = (ctx: AppContext) =>
  new Elysia({ prefix: "/sync", tags: ["Senkron"] })
    .use(authPlugin(ctx))
    .post(
      "/push",
      async ({ user, body }) => {
        const results: Result[] = [];
        for (const item of body.items) {
          const [prev] = await ctx.db
            .select({ status: syncLog.status, reason: syncLog.reason })
            .from(syncLog)
            .where(and(eq(syncLog.itemId, item.id), eq(syncLog.version, item.version)));
          if (prev) {
            results.push({
              id: item.id,
              status: prev.status as Result["status"],
              reason: prev.reason ?? undefined,
            });
            continue;
          }
          const r = await applyItem(ctx, user.id, item);
          await ctx.db
            .insert(syncLog)
            .values({
              itemId: item.id,
              userId: user.id,
              deviceId: body.deviceId,
              entity: item.entity,
              op: item.op,
              version: item.version,
              status: r.status,
              reason: r.reason ?? null,
              payload: item.payload,
            })
            .onConflictDoNothing();
          results.push(r);
        }
        return { results, serverTime: new Date().toISOString() } satisfies SyncPushResponse;
      },
      {
        detail: { summary: "Çevrimdışı birikmiş işlemleri gönder" },
        auth: true,
        body: syncPushRequestSchema,
      },
    )
    /**
     * Delta çekme: `since` sonrası değişen POI'ler, açık ihtiyaçlar, kullanıcının kendi kayıtları
     * ve rota veri sürümü. İlk çağrıda (since yok) tam liste gelir.
     */
    .get(
      "/pull",
      async ({ user, query }) => {
        const [t] = await ctx.db
          .select({ id: trails.id, dataVersion: trails.dataVersion })
          .from(trails)
          .where(eq(trails.slug, query.trail));
        if (!t) return { error: "trail_not_found" };
        const since = query.since ? new Date(query.since) : null;
        const serverTime = new Date();

        const poiRows = await ctx.db
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
          .where(
            and(
              eq(pois.trailId, t.id),
              eq(pois.isPublished, true),
              since ? gt(pois.updatedAt, since) : sql`true`,
            ),
          );

        const needRows = await ctx.db
          .select({
            id: needs.id,
            userId: needs.userId,
            kind: needs.kind,
            note: needs.note,
            status: needs.status,
            paidOk: needs.paidOk,
            location: needs.geomCoarse,
            stageId: needs.stageId,
            expiresAt: needs.expiresAt,
            updatedAt: needs.updatedAt,
            version: needs.version,
            nickname: profiles.nickname,
          })
          .from(needs)
          .leftJoin(profiles, eq(profiles.userId, needs.userId))
          .where(
            and(
              eq(needs.trailId, t.id),
              or(inArray(needs.status, ["open", "offered", "accepted"]), eq(needs.userId, user.id)),
              since ? gt(needs.updatedAt, since) : sql`true`,
            ),
          );

        const hikeRows = await ctx.db
          .select()
          .from(hikes)
          .where(and(eq(hikes.userId, user.id), since ? gt(hikes.updatedAt, since) : sql`true`));

        if (query.deviceId) {
          await ctx.db
            .insert(syncCursors)
            .values({
              userId: user.id,
              deviceId: query.deviceId,
              trailSlug: query.trail,
              lastPullAt: serverTime,
            })
            .onConflictDoUpdate({
              target: [syncCursors.userId, syncCursors.deviceId, syncCursors.trailSlug],
              set: { lastPullAt: serverTime },
            });
        }
        return {
          dataVersion: t.dataVersion,
          pois: poiRows,
          needs: needRows,
          hikes: hikeRows,
          serverTime: serverTime.toISOString(),
        };
      },
      {
        detail: { summary: "Güncel veriyi çek (delta)" },
        auth: true,
        query: syncPullRequestSchema.extend({ deviceId: z.string().min(8).max(64).optional() }),
      },
    );
