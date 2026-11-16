import { index, pgTable, timestamp } from "drizzle-orm/pg-core";
import { geoPoint } from "../geometry";
import { ulidRef } from "./_common";
import { stages, trails } from "./trails";
import { users } from "./users";

/**
 * Canlı harita varlığı. Yalnız kabalaştırılmış konum tutulur, TTL ile düşer.
 * MVP'de Postgres; yoğunluk artarsa Redis GEO'ya taşınır (aynı arayüz).
 */
export const presence = pgTable(
  "presence",
  {
    userId: ulidRef("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    trailId: ulidRef("trail_id")
      .notNull()
      .references(() => trails.id, { onDelete: "cascade" }),
    stageId: ulidRef("stage_id").references(() => stages.id, { onDelete: "set null" }),
    geomCoarse: geoPoint("geom_coarse").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("presence_geom_gix").using("gist", t.geomCoarse),
    index("presence_expires_idx").on(t.expiresAt),
  ],
);
