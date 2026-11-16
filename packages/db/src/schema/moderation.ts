import { char, index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { ulidPk, ulidRef } from "./_common";
import { flagTargetEnum } from "./enums";
import { users } from "./users";

export const flags = pgTable(
  "flags",
  {
    id: ulidPk(),
    targetType: flagTargetEnum("target_type").notNull(),
    targetId: char("target_id", { length: 26 }).notNull(),
    reporterId: ulidRef("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: varchar("reason", { length: 32 }).notNull(), // spam | fake | offensive | outdated | other
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [index("flags_target_idx").on(t.targetType, t.targetId)],
);

export const blocks = pgTable(
  "blocks",
  {
    blockerId: ulidRef("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: ulidRef("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("blocks_pair_idx").on(t.blockerId, t.blockedId)],
);
