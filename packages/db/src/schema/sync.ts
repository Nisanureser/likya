import {
  char,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { ulidRef } from "./_common";
import { users } from "./users";

/** Cihaz başına son başarılı pull zamanı (delta senkron). */
export const syncCursors = pgTable(
  "sync_cursors",
  {
    userId: ulidRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceId: varchar("device_id", { length: 64 }).notNull(),
    trailSlug: varchar("trail_slug", { length: 64 }).notNull(),
    lastPullAt: timestamp("last_pull_at", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.deviceId, t.trailSlug] })],
);

/** Gelen outbox kayıtlarının günlüğü: idempotensi ve hata ayıklama. */
export const syncLog = pgTable(
  "sync_log",
  {
    itemId: char("item_id", { length: 26 }).notNull(),
    userId: ulidRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceId: varchar("device_id", { length: 64 }).notNull(),
    entity: varchar("entity", { length: 32 }).notNull(),
    op: varchar("op", { length: 16 }).notNull(),
    version: integer("version").notNull(),
    status: varchar("status", { length: 16 }).notNull(), // applied | ignored_stale | rejected
    reason: varchar("reason", { length: 200 }),
    payload: jsonb("payload"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.itemId, t.version] }),
    index("sync_log_user_idx").on(t.userId, t.receivedAt),
  ],
);
