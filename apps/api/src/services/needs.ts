import type { Database } from "@patika/db";
import { needOffers, needs, stages, trails } from "@patika/db";
import {
  COARSE_LOCATION_CELL_M,
  coarsen,
  NEED_TTL_HOURS,
  type NeedCreate,
  type NeedStatus,
  type OfferCreate,
} from "@patika/shared";
import { and, eq, inArray, sql } from "drizzle-orm";
import { assertTransition } from "./needs-state";

export class NeedError extends Error {
  constructor(
    public code: string,
    public httpStatus = 400,
  ) {
    super(code);
  }
}

const MAX_OPEN_PER_USER = 3;

/** İhtiyaç oluştur (idempotent: aynı id varsa dokunmaz). Hem /needs hem /sync buradan geçer. */
export async function createNeed(
  db: Database,
  userId: string,
  input: NeedCreate,
): Promise<{ applied: boolean }> {
  const [t] = await db.select({ id: trails.id }).from(trails).where(eq(trails.slug, input.trail));
  if (!t) throw new NeedError("trail_not_found", 404);

  const [existing] = await db.select({ id: needs.id }).from(needs).where(eq(needs.id, input.id));
  if (existing) return { applied: false };

  const [cnt] = await db
    .select({ n: sql<number>`count(*)` })
    .from(needs)
    .where(and(eq(needs.userId, userId), inArray(needs.status, ["open", "offered", "accepted"])));
  if (Number(cnt?.n ?? 0) >= MAX_OPEN_PER_USER) throw new NeedError("too_many_open_needs", 429);

  let stageId: string | null = null;
  if (input.stageSeq) {
    const [s] = await db
      .select({ id: stages.id })
      .from(stages)
      .where(and(eq(stages.trailId, t.id), eq(stages.seq, input.stageSeq)));
    stageId = s?.id ?? null;
  }
  const precise = input.kind === "sos" || input.kind === "lost";
  const ttlMs = NEED_TTL_HOURS[input.kind] * 3600_000;
  const created = new Date(input.deviceCreatedAt);
  await db.insert(needs).values({
    id: input.id,
    userId,
    trailId: t.id,
    stageId,
    kind: input.kind,
    note: input.note ?? null,
    photoKey: input.photoKey ?? null,
    geomCoarse: input.location ? coarsen(input.location, COARSE_LOCATION_CELL_M) : null,
    geomPrecise: precise && input.location ? input.location : null,
    paidOk: input.paidOk,
    status: "open",
    // Cihazda uzun süre beklemiş bir ihtiyaç gelirken süresi dolmuş olabilir; o zaman doğrudan expired.
    expiresAt: new Date(created.getTime() + ttlMs),
    deviceCreatedAt: created,
  });
  if (created.getTime() + ttlMs < Date.now()) {
    await db.update(needs).set({ status: "expired" }).where(eq(needs.id, input.id));
  }
  return { applied: true };
}

export async function createOffer(
  db: Database,
  helperId: string,
  input: OfferCreate,
): Promise<{ applied: boolean }> {
  const [need] = await db
    .select({ id: needs.id, userId: needs.userId, status: needs.status })
    .from(needs)
    .where(eq(needs.id, input.needId));
  if (!need) throw new NeedError("need_not_found", 404);
  if (need.userId === helperId) throw new NeedError("cannot_offer_own_need");
  if (need.status !== "open" && need.status !== "offered") throw new NeedError("need_not_open");
  const [existing] = await db
    .select({ id: needOffers.id })
    .from(needOffers)
    .where(eq(needOffers.id, input.id));
  if (existing) return { applied: false };
  await db.insert(needOffers).values({
    id: input.id,
    needId: need.id,
    helperId,
    message: input.message ?? null,
    deviceCreatedAt: new Date(input.deviceCreatedAt),
  });
  if (need.status === "open") {
    await db
      .update(needs)
      .set({ status: "offered", version: sql`${needs.version} + 1`, updatedAt: sql`now()` })
      .where(eq(needs.id, need.id));
  }
  return { applied: true };
}

/** Sahip tarafından durum değişikliği (iptal, tamamlandı). Teklif kabulü ayrı fonksiyonda. */
export async function ownerSetStatus(
  db: Database,
  userId: string,
  needId: string,
  to: NeedStatus,
): Promise<void> {
  const [need] = await db
    .select({ userId: needs.userId, status: needs.status })
    .from(needs)
    .where(eq(needs.id, needId));
  if (!need) throw new NeedError("need_not_found", 404);
  if (need.userId !== userId) throw new NeedError("forbidden", 403);
  if (to !== "cancelled" && to !== "completed") throw new NeedError("status_not_allowed");
  assertTransition(need.status, to);
  await db
    .update(needs)
    .set({
      status: to,
      resolvedAt: new Date(),
      version: sql`${needs.version} + 1`,
      updatedAt: sql`now()`,
    })
    .where(eq(needs.id, needId));
}

export async function ownerDecideOffer(
  db: Database,
  userId: string,
  offerId: string,
  decision: "accepted" | "declined",
): Promise<void> {
  const [row] = await db
    .select({
      offerId: needOffers.id,
      offerStatus: needOffers.status,
      needId: needs.id,
      needOwner: needs.userId,
      needStatus: needs.status,
    })
    .from(needOffers)
    .innerJoin(needs, eq(needs.id, needOffers.needId))
    .where(eq(needOffers.id, offerId));
  if (!row) throw new NeedError("offer_not_found", 404);
  if (row.needOwner !== userId) throw new NeedError("forbidden", 403);
  if (row.offerStatus !== "offered") throw new NeedError("offer_not_pending");

  await db.transaction(async (tx) => {
    await tx
      .update(needOffers)
      .set({ status: decision, updatedAt: sql`now()` })
      .where(eq(needOffers.id, offerId));
    if (decision === "accepted") {
      assertTransition(row.needStatus, "accepted");
      await tx
        .update(needs)
        .set({
          status: "accepted",
          acceptedOfferId: offerId,
          version: sql`${needs.version} + 1`,
          updatedAt: sql`now()`,
        })
        .where(eq(needs.id, row.needId));
    } else {
      // Başka bekleyen teklif kalmadıysa yeniden "open"
      const [cnt] = await tx
        .select({ n: sql<number>`count(*)` })
        .from(needOffers)
        .where(and(eq(needOffers.needId, row.needId), eq(needOffers.status, "offered")));
      if (Number(cnt?.n ?? 0) === 0 && row.needStatus === "offered") {
        await tx
          .update(needs)
          .set({ status: "open", version: sql`${needs.version} + 1`, updatedAt: sql`now()` })
          .where(eq(needs.id, row.needId));
      }
    }
  });
}

export async function helperWithdraw(
  db: Database,
  helperId: string,
  offerId: string,
): Promise<void> {
  const [o] = await db
    .select({ helperId: needOffers.helperId, status: needOffers.status, needId: needOffers.needId })
    .from(needOffers)
    .where(eq(needOffers.id, offerId));
  if (!o) throw new NeedError("offer_not_found", 404);
  if (o.helperId !== helperId) throw new NeedError("forbidden", 403);
  if (o.status !== "offered") throw new NeedError("offer_not_pending");
  await db
    .update(needOffers)
    .set({ status: "withdrawn", updatedAt: sql`now()` })
    .where(eq(needOffers.id, offerId));
}

/** Süresi dolmuş ihtiyaçları kapat (zamanlayıcı). */
export async function expireNeeds(db: Database): Promise<number> {
  const rows = await db
    .update(needs)
    .set({ status: "expired", version: sql`${needs.version} + 1`, updatedAt: sql`now()` })
    .where(and(inArray(needs.status, ["open", "offered"]), sql`${needs.expiresAt} < now()`))
    .returning({ id: needs.id });
  return rows.length;
}
