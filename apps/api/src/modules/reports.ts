import { poiReports, profiles } from "@patika/db";
import { poiReportSchema, poiSuggestionSchema } from "@patika/shared";
import { and, desc, eq, isNull } from "drizzle-orm";
import { Elysia } from "elysia";
import type { AppContext } from "../context";
import { authPlugin } from "../plugins/auth";
import { addPoiReport, addPoiSuggestion } from "../services/reports";

export const reportsModule = (ctx: AppContext) =>
  new Elysia({ tags: ["POI raporu"] })
    .use(authPlugin(ctx))
    .get(
      "/pois/:id/reports",
      async ({ params }) => {
        return ctx.db
          .select({
            id: poiReports.id,
            status: poiReports.status,
            note: poiReports.note,
            photoKey: poiReports.photoKey,
            observedAt: poiReports.observedAt,
            confirmations: poiReports.confirmations,
            nickname: profiles.nickname,
          })
          .from(poiReports)
          .leftJoin(profiles, eq(profiles.userId, poiReports.userId))
          .where(and(eq(poiReports.poiId, params.id), isNull(poiReports.hiddenAt)))
          .orderBy(desc(poiReports.observedAt))
          .limit(30);
      },
      { detail: { summary: "Bir noktanın rapor geçmişi" } },
    )
    .post(
      "/pois/:id/reports",
      async ({ user, params, body, status }) => {
        const r = await addPoiReport(ctx.db, user.id, { ...body, poiId: params.id }, new Date());
        if (!r.applied && r.reason === "poi_not_found") return status(404, { error: r.reason });
        return r;
      },
      {
        detail: { summary: "Durum bildir (akıyor/kuru/açık/kapalı…)" },
        auth: true,
        body: poiReportSchema.omit({ poiId: true }),
      },
    )
    .post(
      "/pois/suggestions",
      async ({ user, body }) => addPoiSuggestion(ctx.db, user.id, body, new Date()),
      { detail: { summary: "Yeni nokta öner" }, auth: true, body: poiSuggestionSchema },
    );
