import { geo, needOffers, needs, profiles, trails } from "@patika/db";
import { NEED_KINDS, needCreateSchema, offerCreateSchema } from "@patika/shared";
import { and, asc, desc, eq, gt, inArray, or } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";
import type { AppContext } from "../context";
import { authPlugin } from "../plugins/auth";
import {
  createNeed,
  createOffer,
  helperWithdraw,
  NeedError,
  ownerDecideOffer,
  ownerSetStatus,
} from "../services/needs";

const handle = (e: unknown, status: (code: number, body: unknown) => unknown) => {
  if (e instanceof NeedError) return status(e.httpStatus, { error: e.code });
  if (e instanceof Error && e.message.startsWith("Geçersiz durum geçişi"))
    return status(409, { error: "invalid_transition", detail: e.message });
  throw e;
};

export const needsModule = (ctx: AppContext) =>
  new Elysia({ prefix: "/needs", tags: ["İhtiyaç"] })
    .use(authPlugin(ctx))
    /** Açık ihtiyaçlar: etap panosu (stageSeq) veya yakınlık (lon/lat) ile. */
    .get(
      "/",
      async ({ user, query, status }) => {
        const [t] = await ctx.db
          .select({ id: trails.id })
          .from(trails)
          .where(eq(trails.slug, query.trail));
        if (!t) return status(404, { error: "trail_not_found" });
        const conds = [
          eq(needs.trailId, t.id),
          inArray(needs.status, ["open", "offered", "accepted"]),
          gt(needs.expiresAt, new Date()),
        ];
        if (query.kind) conds.push(eq(needs.kind, query.kind));
        if (query.lon != null && query.lat != null)
          conds.push(geo.dwithin(needs.geomCoarse, query.lon, query.lat, query.radiusM));
        const rows = await ctx.db
          .select({
            id: needs.id,
            kind: needs.kind,
            note: needs.note,
            photoKey: needs.photoKey,
            status: needs.status,
            paidOk: needs.paidOk,
            location: needs.geomCoarse,
            stageId: needs.stageId,
            expiresAt: needs.expiresAt,
            createdAt: needs.createdAt,
            version: needs.version,
            userId: needs.userId,
            nickname: profiles.nickname,
            avatarKey: profiles.avatarKey,
            helpedCount: profiles.helpedCount,
          })
          .from(needs)
          .leftJoin(profiles, eq(profiles.userId, needs.userId))
          .where(and(...conds))
          .orderBy(desc(needs.createdAt))
          .limit(200);
        return {
          needs: rows.map((r) => ({ ...r, mine: r.userId === user.id })),
          serverTime: new Date().toISOString(),
        };
      },
      {
        detail: { summary: "Yakındaki açık ihtiyaçlar" },
        auth: true,
        query: z.object({
          trail: z.string(),
          kind: z.enum(NEED_KINDS).optional(),
          lon: z.coerce.number().optional(),
          lat: z.coerce.number().optional(),
          radiusM: z.coerce.number().min(500).max(100_000).default(20_000),
        }),
      },
    )
    .post(
      "/",
      async ({ user, body, status }) => {
        try {
          return await createNeed(ctx.db, user.id, body);
        } catch (e) {
          return handle(e, status as never);
        }
      },
      { detail: { summary: "İhtiyaç bildir (emoji balonu)" }, auth: true, body: needCreateSchema },
    )
    /** Detay: hassas konum yalnız sahibine ve kabul edilmiş yardımcıya. */
    .get(
      "/:id",
      async ({ user, params, status }) => {
        const [n] = await ctx.db.select().from(needs).where(eq(needs.id, params.id));
        if (!n) return status(404, { error: "need_not_found" });
        const offers = await ctx.db
          .select({
            id: needOffers.id,
            helperId: needOffers.helperId,
            message: needOffers.message,
            status: needOffers.status,
            createdAt: needOffers.createdAt,
            nickname: profiles.nickname,
            helpedCount: profiles.helpedCount,
          })
          .from(needOffers)
          .leftJoin(profiles, eq(profiles.userId, needOffers.helperId))
          .where(eq(needOffers.needId, n.id))
          .orderBy(asc(needOffers.createdAt));
        const isOwner = n.userId === user.id;
        const acceptedHelper = offers.find((o) => o.id === n.acceptedOfferId)?.helperId;
        const canSeePrecise = isOwner || acceptedHelper === user.id;
        const { geomPrecise, ...rest } = n;
        return {
          ...rest,
          location: rest.geomCoarse,
          preciseLocation: canSeePrecise ? geomPrecise : null,
          mine: isOwner,
          // Sahip tüm teklifleri görür; diğerleri yalnız kendi teklifini.
          offers: isOwner ? offers : offers.filter((o) => o.helperId === user.id),
        };
      },
      { detail: { summary: "İhtiyaç detayı ve teklifler" }, auth: true },
    )
    .patch(
      "/:id/status",
      async ({ user, params, body, status }) => {
        try {
          await ownerSetStatus(ctx.db, user.id, params.id, body.status);
          return { ok: true };
        } catch (e) {
          return handle(e, status as never);
        }
      },
      {
        detail: { summary: "İhtiyacı kapat (tamamlandı/iptal)" },
        auth: true,
        body: z.object({ status: z.enum(["cancelled", "completed"]) }),
      },
    )
    .post(
      "/:id/offers",
      async ({ user, params, body, status }) => {
        try {
          return await createOffer(ctx.db, user.id, { ...body, needId: params.id });
        } catch (e) {
          return handle(e, status as never);
        }
      },
      {
        detail: { summary: "Yardım teklif et" },
        auth: true,
        body: offerCreateSchema.omit({ needId: true }),
      },
    )
    .patch(
      "/offers/:offerId",
      async ({ user, params, body, status }) => {
        try {
          if (body.decision === "withdrawn") await helperWithdraw(ctx.db, user.id, params.offerId);
          else await ownerDecideOffer(ctx.db, user.id, params.offerId, body.decision);
          return { ok: true };
        } catch (e) {
          return handle(e, status as never);
        }
      },
      {
        detail: { summary: "Teklifi kabul/ret/geri çek" },
        auth: true,
        body: z.object({ decision: z.enum(["accepted", "declined", "withdrawn"]) }),
      },
    )
    /** Kendi ihtiyaçlarım ve teklif verdiklerim. */
    .get(
      "/mine",
      async ({ user }) => {
        const mine = await ctx.db
          .select()
          .from(needs)
          .where(eq(needs.userId, user.id))
          .orderBy(desc(needs.createdAt))
          .limit(50);
        const helping = await ctx.db
          .select({ need: needs, offer: needOffers })
          .from(needOffers)
          .innerJoin(needs, eq(needs.id, needOffers.needId))
          .where(
            and(
              eq(needOffers.helperId, user.id),
              or(eq(needOffers.status, "offered"), eq(needOffers.status, "accepted")),
            ),
          )
          .orderBy(desc(needOffers.createdAt))
          .limit(50);
        return {
          mine: mine.map(({ geomPrecise, ...n }) => ({ ...n, preciseLocation: geomPrecise })),
          helping,
        };
      },
      { detail: { summary: "Benim ihtiyaçlarım ve tekliflerim" }, auth: true },
    );
