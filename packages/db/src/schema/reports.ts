import { index, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { geoPoint } from "../geometry";
import { ulidPk, ulidRef } from "./_common";
import { poiReportStatusEnum } from "./enums";
import { pois } from "./trails";
import { users } from "./users";

/**
 * POI durum raporu — ekleme-yalnız olay. Çakışma yönetimi gerekmez:
 * iki cihaz aynı çeşmeye farklı rapor verirse ikisi de saklanır,
 * `pois.derived` en yeni ve en çok onaylanan raporlardan türetilir.
 */
export const poiReports = pgTable(
  "poi_reports",
  {
    id: ulidPk(),
    poiId: ulidRef("poi_id")
      .notNull()
      .references(() => pois.id, { onDelete: "cascade" }),
    userId: ulidRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: poiReportStatusEnum("status").notNull(),
    note: text("note"),
    photoKey: varchar("photo_key", { length: 200 }),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    /** Rapor verenin konumu (hassas; yalnız güven hesabı için, dışarı verilmez). */
    reporterGeom: geoPoint("reporter_geom"),
    /** POI'ye uzaklık (metre); 500 m'den uzak raporların ağırlığı düşer. */
    distanceToPoiM: integer("distance_to_poi_m"),
    confirmations: integer("confirmations").notNull().default(0),
    flags: integer("flags").notNull().default(0),
    deviceCreatedAt: timestamp("device_created_at", { withTimezone: true }).notNull(),
    syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
    hiddenAt: timestamp("hidden_at", { withTimezone: true }),
  },
  (t) => [
    index("poi_reports_poi_time_idx").on(t.poiId, t.observedAt),
    index("poi_reports_user_idx").on(t.userId, t.syncedAt),
  ],
);
