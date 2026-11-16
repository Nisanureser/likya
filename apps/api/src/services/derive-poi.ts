import type { Database } from "@patika/db";
import { poiReports, pois } from "@patika/db";
import type { PoiReportStatus } from "@patika/shared";
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";

/**
 * Bir POI'nin türetilmiş durumunu son 30 günün raporlarından hesaplar.
 * Ağırlık: yenilik (yarı ömür 7 gün) × yakınlık (POI'ye 500 m içindeyse 1, uzaksa 0.4) × onay (1 + confirmations*0.2).
 * Şimdilik basit; FarOut'un "son 2 hafta" modeline yakın. İleride mevsim ve kullanıcı itibarı eklenir.
 */
export async function derivePoiStatus(db: Database, poiId: string): Promise<void> {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const rows = await db
    .select({
      status: poiReports.status,
      observedAt: poiReports.observedAt,
      distanceToPoiM: poiReports.distanceToPoiM,
      confirmations: poiReports.confirmations,
      flags: poiReports.flags,
    })
    .from(poiReports)
    .where(
      and(
        eq(poiReports.poiId, poiId),
        gte(poiReports.observedAt, since),
        isNull(poiReports.hiddenAt),
      ),
    )
    .orderBy(desc(poiReports.observedAt))
    .limit(50);

  const scores = new Map<PoiReportStatus, number>();
  let total = 0;
  const now = Date.now();
  for (const r of rows) {
    if (r.flags >= 3) continue;
    const ageDays = (now - r.observedAt.getTime()) / 86_400_000;
    const recency = 0.5 ** (ageDays / 7);
    const proximity = r.distanceToPoiM == null ? 0.7 : r.distanceToPoiM <= 500 ? 1 : 0.4;
    const w = recency * proximity * (1 + r.confirmations * 0.2);
    scores.set(r.status, (scores.get(r.status) ?? 0) + w);
    total += w;
  }
  let best: PoiReportStatus | null = null;
  let bestScore = 0;
  for (const [s, v] of scores) {
    if (v > bestScore) {
      best = s;
      bestScore = v;
    }
  }

  await db
    .update(pois)
    .set({
      derived: {
        status: best,
        lastReportAt: rows[0]?.observedAt.toISOString() ?? null,
        reportCount30d: rows.length,
        confidence:
          total === 0 ? 0 : Math.min(1, (bestScore / total) * Math.min(1, rows.length / 3)),
      },
      updatedAt: sql`now()`,
    })
    .where(eq(pois.id, poiId));
}
