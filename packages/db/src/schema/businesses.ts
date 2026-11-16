import type { I18nText } from "@patika/shared";
import { index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { geoPoint } from "../geometry";
import { timestamps, ulidPk, ulidRef } from "./_common";
import { businessTierEnum } from "./enums";

/** Ücretli yerel hizmet sağlayıcı (pansiyon, transfer, bagaj). Dayanışma akışından ayrı. */
export const businesses = pgTable(
  "businesses",
  {
    id: ulidPk(),
    trailId: ulidRef("trail_id").notNull(),
    type: varchar("type", { length: 32 }).notNull(), // lodging | transport | luggage | food | gear
    name: varchar("name", { length: 120 }).notNull(),
    description: jsonb("description").$type<I18nText>(),
    geom: geoPoint("geom"),
    contact: jsonb("contact").$type<{
      phone?: string;
      whatsapp?: string;
      web?: string;
      email?: string;
    }>(),
    tier: businessTierEnum("tier").notNull().default("free"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    ownerUserId: ulidRef("owner_user_id"),
    ...timestamps,
  },
  (t) => [index("businesses_trail_idx").on(t.trailId, t.type)],
);
