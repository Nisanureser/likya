import { hikes, lastKnown } from "@patika/db";
import { hikeSchema, lastKnownSchema } from "@patika/shared";
import { and, desc, eq, inArray } from "drizzle-orm";
import { Elysia } from "elysia";
import type { AppContext } from "../context";
import { authPlugin } from "../plugins/auth";
import { upsertHike, upsertLastKnown } from "../services/hikes";

export const hikesModule = (ctx: AppContext) =>
  new Elysia({ tags: ["Güvenlik"] })
    .use(authPlugin(ctx))
    .get(
      "/hikes",
      async ({ user }) =>
        ctx.db
          .select()
          .from(hikes)
          .where(eq(hikes.userId, user.id))
          .orderBy(desc(hikes.plannedStart))
          .limit(50),
      { detail: { summary: "Yürüyüş planlarım" }, auth: true },
    )
    .get(
      "/hikes/active",
      async ({ user }) => {
        const [h] = await ctx.db
          .select()
          .from(hikes)
          .where(
            and(eq(hikes.userId, user.id), inArray(hikes.status, ["planned", "active", "overdue"])),
          )
          .orderBy(desc(hikes.plannedStart))
          .limit(1);
        return h ?? null;
      },
      { detail: { summary: "Aktif yürüyüş planı" }, auth: true },
    )
    .put(
      "/hikes/:id",
      async ({ user, params, body, status }) => {
        try {
          return await upsertHike(ctx.db, user.id, { ...body, id: params.id });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "error";
          return status(msg === "forbidden" ? 403 : 400, { error: msg });
        }
      },
      {
        detail: { summary: "Plan oluştur/güncelle" },
        auth: true,
        body: hikeSchema.omit({ id: true }),
      },
    )
    /** "Vardım" — gecikme bildirimlerini durdurur. */
    .post(
      "/hikes/:id/arrive",
      async ({ user, params, status }) => {
        const [h] = await ctx.db
          .select({ userId: hikes.userId, version: hikes.version })
          .from(hikes)
          .where(eq(hikes.id, params.id));
        if (!h) return status(404, { error: "hike_not_found" });
        if (h.userId !== user.id) return status(403, { error: "forbidden" });
        await ctx.db
          .update(hikes)
          .set({ status: "arrived", arrivedAt: new Date(), version: h.version + 1 })
          .where(eq(hikes.id, params.id));
        return { ok: true, version: h.version + 1 };
      },
      { detail: { summary: "Vardım" }, auth: true },
    )
    .put("/last-known", async ({ user, body }) => upsertLastKnown(ctx.db, user.id, body), {
      detail: { summary: "Son bilinen konumu kaydet" },
      auth: true,
      body: lastKnownSchema,
    })
    .get(
      "/last-known",
      async ({ user }) => {
        const [lk] = await ctx.db.select().from(lastKnown).where(eq(lastKnown.userId, user.id));
        return lk ?? null;
      },
      { detail: { summary: "Son bilinen konum" }, auth: true },
    );
