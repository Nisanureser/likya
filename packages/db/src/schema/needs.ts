import { boolean, index, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { geoPoint } from "../geometry";
import { timestamps, ulidPk, ulidRef } from "./_common";
import { needKindEnum, needStatusEnum, offerStatusEnum } from "./enums";
import { stages, trails } from "./trails";
import { users } from "./users";

export const needs = pgTable(
  "needs",
  {
    id: ulidPk(),
    userId: ulidRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trailId: ulidRef("trail_id")
      .notNull()
      .references(() => trails.id, { onDelete: "cascade" }),
    stageId: ulidRef("stage_id").references(() => stages.id, { onDelete: "set null" }),
    kind: needKindEnum("kind").notNull(),
    note: text("note"),
    photoKey: varchar("photo_key", { length: 200 }),
    /** Herkese gösterilen kabalaştırılmış konum. */
    geomCoarse: geoPoint("geom_coarse"),
    /** Yalnız SOS/lost için hassas konum; sadece sahibi, yardım teklifi kabul edilen kişi ve rızayla arama-kurtarma. */
    geomPrecise: geoPoint("geom_precise"),
    paidOk: boolean("paid_ok").notNull().default(false),
    status: needStatusEnum("status").notNull().default("open"),
    acceptedOfferId: ulidRef("accepted_offer_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    deviceCreatedAt: timestamp("device_created_at", { withTimezone: true }).notNull(),
    version: integer("version").notNull().default(1),
    ...timestamps,
  },
  (t) => [
    index("needs_trail_status_idx").on(t.trailId, t.status, t.expiresAt),
    index("needs_user_idx").on(t.userId, t.createdAt),
    index("needs_geom_gix").using("gist", t.geomCoarse),
  ],
);

export const needOffers = pgTable(
  "need_offers",
  {
    id: ulidPk(),
    needId: ulidRef("need_id")
      .notNull()
      .references(() => needs.id, { onDelete: "cascade" }),
    helperId: ulidRef("helper_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message"),
    status: offerStatusEnum("status").notNull().default("offered"),
    deviceCreatedAt: timestamp("device_created_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index("need_offers_need_idx").on(t.needId, t.status)],
);

/** Basit mesajlaşma: yalnız kabul edilmiş bir teklif üzerinden açılır. */
export const messages = pgTable(
  "messages",
  {
    id: ulidPk(),
    offerId: ulidRef("offer_id")
      .notNull()
      .references(() => needOffers.id, { onDelete: "cascade" }),
    senderId: ulidRef("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_offer_idx").on(t.offerId, t.createdAt)],
);
