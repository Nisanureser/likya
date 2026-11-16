import { sql } from "drizzle-orm";
import { char, index, integer, pgTable, real, timestamp } from "drizzle-orm/pg-core";
import { geoPoint } from "../geometry";
import { timestamps, ulidPk, ulidRef } from "./_common";
import { hikeStatusEnum } from "./enums";
import { stages, trails } from "./trails";
import { users } from "./users";

/** Yürüyüş planı: başlangıç/bitiş etabı, tahmini varış, güvenilir kişiler. */
export const hikes = pgTable(
  "hikes",
  {
    id: ulidPk(),
    userId: ulidRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trailId: ulidRef("trail_id")
      .notNull()
      .references(() => trails.id, { onDelete: "cascade" }),
    startStageId: ulidRef("start_stage_id").references(() => stages.id, { onDelete: "set null" }),
    endStageId: ulidRef("end_stage_id").references(() => stages.id, { onDelete: "set null" }),
    plannedStart: timestamp("planned_start", { withTimezone: true }).notNull(),
    plannedEta: timestamp("planned_eta", { withTimezone: true }).notNull(),
    status: hikeStatusEnum("status").notNull().default("planned"),
    trustedContactIds: char("trusted_contact_ids", { length: 26 })
      .array()
      .notNull()
      .default(sql`'{}'::char(26)[]`),
    /** Gecikme bildirimleri: önce kullanıcıya (ETA+30dk), sonra kişiye (ETA+2sa). */
    userRemindedAt: timestamp("user_reminded_at", { withTimezone: true }),
    contactNotifiedAt: timestamp("contact_notified_at", { withTimezone: true }),
    arrivedAt: timestamp("arrived_at", { withTimezone: true }),
    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (t) => [
    index("hikes_user_idx").on(t.userId, t.status),
    index("hikes_overdue_idx").on(t.status, t.plannedEta),
  ],
);

/**
 * Son bilinen konum: kullanıcı başına tek satır (upsert). Hassas konum.
 * Yalnız sahibi görür; gecikme durumunda güvenilir kişiye, rıza varsa arama-kurtarmaya açılır.
 */
export const lastKnown = pgTable("last_known", {
  userId: ulidRef("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  hikeId: ulidRef("hike_id").references(() => hikes.id, { onDelete: "set null" }),
  geom: geoPoint("geom").notNull(),
  accuracyM: real("accuracy_m"),
  batteryPct: integer("battery_pct"),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
});
