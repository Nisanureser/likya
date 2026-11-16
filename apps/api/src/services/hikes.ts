import type { Database } from "@patika/db";
import { hikes, lastKnown, stages, trails, trustedContacts, users } from "@patika/db";
import type { HikeInput, LastKnownInput } from "@patika/shared";
import { and, eq, inArray, lt, sql } from "drizzle-orm";
import type { Mailer } from "./mail";
import { notifyUser } from "./notify";

export const USER_REMINDER_AFTER_MS = 30 * 60_000; // ETA + 30 dk → kullanıcıya hatırlatma
export const CONTACT_NOTIFY_AFTER_MS = 2 * 60 * 60_000; // ETA + 2 saat → güvenilir kişiye bildirim

/** LWW upsert: gelen version mevcut olandan küçükse yok sayılır. */
export async function upsertHike(
  db: Database,
  userId: string,
  input: HikeInput,
): Promise<{ applied: boolean; version: number }> {
  const [t] = await db.select({ id: trails.id }).from(trails).where(eq(trails.slug, input.trail));
  if (!t) throw new Error("trail_not_found");
  const [existing] = await db
    .select({ userId: hikes.userId, version: hikes.version })
    .from(hikes)
    .where(eq(hikes.id, input.id));
  if (existing && existing.userId !== userId) throw new Error("forbidden");
  if (existing && input.version < existing.version)
    return { applied: false, version: existing.version };
  const seqs = await db
    .select({ id: stages.id, seq: stages.seq })
    .from(stages)
    .where(
      and(eq(stages.trailId, t.id), inArray(stages.seq, [input.startStageSeq, input.endStageSeq])),
    );
  const data = {
    userId,
    trailId: t.id,
    startStageId: seqs.find((s) => s.seq === input.startStageSeq)?.id ?? null,
    endStageId: seqs.find((s) => s.seq === input.endStageSeq)?.id ?? null,
    plannedStart: new Date(input.plannedStart),
    plannedEta: new Date(input.plannedEta),
    status: input.status,
    trustedContactIds: input.trustedContactIds,
    version: input.version,
    arrivedAt: input.status === "arrived" ? new Date() : null,
  };
  await db
    .insert(hikes)
    .values({ id: input.id, ...data })
    .onConflictDoUpdate({ target: hikes.id, set: { ...data, updatedAt: sql`now()` } });
  return { applied: true, version: input.version };
}

export async function upsertLastKnown(
  db: Database,
  userId: string,
  input: LastKnownInput,
): Promise<{ applied: boolean }> {
  const recordedAt = new Date(input.recordedAt);
  const [existing] = await db
    .select({ recordedAt: lastKnown.recordedAt })
    .from(lastKnown)
    .where(eq(lastKnown.userId, userId));
  if (existing && existing.recordedAt >= recordedAt) return { applied: false };
  const data = {
    hikeId: input.hikeId ?? null,
    geom: input.location,
    accuracyM: input.accuracyM ?? null,
    batteryPct: input.batteryPct == null ? null : Math.round(input.batteryPct),
    recordedAt,
    syncedAt: new Date(),
  };
  await db
    .insert(lastKnown)
    .values({ userId, ...data })
    .onConflictDoUpdate({ target: lastKnown.userId, set: data });
  return { applied: true };
}

/**
 * Gecikme kontrolü (zamanlayıcı, dakikada bir):
 * 1) ETA + 30 dk geçti, kullanıcı uyarılmadı → push: "Vardın mı?"
 * 2) ETA + 2 sa geçti, kişi bilgilendirilmedi → status=overdue, güvenilir kişilere e-posta (SMS sağlayıcı eklenince SMS)
 */
export async function checkOverdueHikes(
  db: Database,
  mailer: Mailer,
): Promise<{ reminded: number; notified: number }> {
  const now = Date.now();
  let reminded = 0;
  let notified = 0;

  const toRemind = await db
    .select({ id: hikes.id, userId: hikes.userId })
    .from(hikes)
    .where(
      and(
        inArray(hikes.status, ["planned", "active"]),
        lt(hikes.plannedEta, new Date(now - USER_REMINDER_AFTER_MS)),
        sql`${hikes.userRemindedAt} is null`,
      ),
    );
  for (const h of toRemind) {
    await notifyUser(db, h.userId, {
      title: "Vardın mı?",
      body: "Planladığın varış saati geçti. Güvendeysen 'Vardım' de; yoksa güvenilir kişin 2 saat içinde bilgilendirilecek.",
    });
    await db.update(hikes).set({ userRemindedAt: new Date() }).where(eq(hikes.id, h.id));
    reminded++;
  }

  const toNotify = await db
    .select({
      id: hikes.id,
      userId: hikes.userId,
      contactIds: hikes.trustedContactIds,
      plannedEta: hikes.plannedEta,
    })
    .from(hikes)
    .where(
      and(
        inArray(hikes.status, ["planned", "active"]),
        lt(hikes.plannedEta, new Date(now - CONTACT_NOTIFY_AFTER_MS)),
        sql`${hikes.contactNotifiedAt} is null`,
      ),
    );
  for (const h of toNotify) {
    const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, h.userId));
    const [lk] = await db.select().from(lastKnown).where(eq(lastKnown.userId, h.userId));
    const contacts = h.contactIds.length
      ? await db.select().from(trustedContacts).where(inArray(trustedContacts.id, h.contactIds))
      : [];
    const loc = lk
      ? `${lk.geom[1].toFixed(5)}, ${lk.geom[0].toFixed(5)} (${lk.recordedAt.toISOString()})`
      : "bilinmiyor";
    for (const c of contacts) {
      const text = `${u?.email ?? "Bir yürüyüşçü"} planladığı varış saatinden (${h.plannedEta.toISOString()}) 2 saat geçmesine rağmen varış onayı vermedi.\nSon bilinen konum: ${loc}\nGoogle Maps: ${lk ? `https://maps.google.com/?q=${lk.geom[1]},${lk.geom[0]}` : "-"}\n\nBu bir otomatik bildirimdir. Acil durum için 112'yi arayın.`;
      if (c.email) await mailer.send(c.email, "Patika: varış onayı gelmedi", text);
      // TODO: SMS sağlayıcı (Netgsm / Twilio) bağlanınca c.phone'a kısa metin.
      else console.log(`[sms→${c.phone}] ${text.slice(0, 160)}`);
    }
    await db
      .update(hikes)
      .set({ status: "overdue", contactNotifiedAt: new Date(), updatedAt: sql`now()` })
      .where(eq(hikes.id, h.id));
    notified++;
  }
  return { reminded, notified };
}
