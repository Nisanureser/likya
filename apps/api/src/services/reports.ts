import type { Database } from "@patika/db";
import { geo, poiReports, poiSuggestions, pois, profiles, trails } from "@patika/db";
import type { PoiReportInput, PoiSuggestionInput } from "@patika/shared";
import { eq, sql } from "drizzle-orm";
import { derivePoiStatus } from "./derive-poi";

export async function addPoiReport(
  db: Database,
  userId: string,
  input: PoiReportInput,
  deviceCreatedAt: Date,
): Promise<{ applied: boolean; reason?: string }> {
  const [poi] = await db
    .select({ id: pois.id, geom: pois.geom })
    .from(pois)
    .where(eq(pois.id, input.poiId));
  if (!poi) return { applied: false, reason: "poi_not_found" };
  const [existing] = await db
    .select({ id: poiReports.id })
    .from(poiReports)
    .where(eq(poiReports.id, input.id));
  if (existing) return { applied: false, reason: "duplicate" };

  let distanceToPoiM: number | null = null;
  if (input.location) {
    const [r] = await db
      .select({ d: geo.distanceM(pois.geom, input.location[0], input.location[1]) })
      .from(pois)
      .where(eq(pois.id, poi.id));
    distanceToPoiM = r ? Math.round(Number(r.d)) : null;
  }
  await db.insert(poiReports).values({
    id: input.id,
    poiId: poi.id,
    userId,
    status: input.status,
    note: input.note ?? null,
    photoKey: input.photoKey ?? null,
    observedAt: new Date(input.observedAt),
    reporterGeom: input.location ?? null,
    distanceToPoiM,
    deviceCreatedAt,
  });
  await db
    .update(profiles)
    .set({ reportCount: sql`${profiles.reportCount} + 1` })
    .where(eq(profiles.userId, userId));
  await derivePoiStatus(db, poi.id);
  return { applied: true };
}

export async function addPoiSuggestion(
  db: Database,
  userId: string,
  input: PoiSuggestionInput,
  deviceCreatedAt: Date,
): Promise<{ applied: boolean; reason?: string }> {
  const [t] = await db.select({ id: trails.id }).from(trails).where(eq(trails.slug, input.trail));
  if (!t) return { applied: false, reason: "trail_not_found" };
  const [existing] = await db
    .select({ id: poiSuggestions.id })
    .from(poiSuggestions)
    .where(eq(poiSuggestions.id, input.id));
  if (existing) return { applied: false, reason: "duplicate" };
  await db.insert(poiSuggestions).values({
    id: input.id,
    trailId: t.id,
    userId,
    type: input.type,
    name: input.name,
    geom: input.location,
    note: input.note ?? null,
    photoKey: input.photoKey ?? null,
    quantity: input.quantity ?? null,
    observedAt: new Date(input.observedAt),
    deviceCreatedAt,
  });
  return { applied: true };
}
