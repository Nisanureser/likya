import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps, ulidPk, ulidRef } from "./_common";
import { ageBandEnum, contactChannelEnum, experienceEnum, localeEnum, platformEnum } from "./enums";

export const users = pgTable(
  "users",
  {
    id: ulidPk(),
    email: varchar("email", { length: 254 }),
    /** SOS/ihtiyaç göndermek için doğrulanmış telefon (E.164). Girişte zorunlu değil. */
    phone: varchar("phone", { length: 20 }),
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
    appleSub: varchar("apple_sub", { length: 255 }),
    googleSub: varchar("google_sub", { length: 255 }),
    isAdmin: boolean("is_admin").notNull().default(false),
    bannedAt: timestamp("banned_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("users_email_uq").on(sql`lower(${t.email})`),
    uniqueIndex("users_phone_uq").on(t.phone),
    uniqueIndex("users_apple_uq").on(t.appleSub),
    uniqueIndex("users_google_uq").on(t.googleSub),
  ],
);

/** E-posta ile tek kullanımlık giriş kodu. */
export const authCodes = pgTable(
  "auth_codes",
  {
    id: ulidPk(),
    email: varchar("email", { length: 254 }).notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("auth_codes_email_idx").on(t.email, t.createdAt)],
);

export const profiles = pgTable("profiles", {
  userId: ulidRef("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  nickname: varchar("nickname", { length: 32 }).notNull(),
  avatarKey: varchar("avatar_key", { length: 200 }),
  ageBand: ageBandEnum("age_band"),
  experience: experienceEnum("experience"),
  languages: text("languages").array().notNull().default(sql`'{}'::text[]`),
  about: text("about"),
  canHelp: text("can_help").array().notNull().default(sql`'{}'::text[]`),
  locale: localeEnum("locale").notNull().default("tr"),
  /** { shareLocation, womenOnly, hideAtNight } — bkz. @patika/shared profileSchema */
  visibility: jsonb("visibility")
    .$type<{ shareLocation: boolean; womenOnly: boolean; hideAtNight: boolean }>()
    .notNull()
    .default({ shareLocation: false, womenOnly: false, hideAtNight: true }),
  /** İtibar: tamamlanan yardım sayısı, onaylanan rapor sayısı. */
  helpedCount: integer("helped_count").notNull().default(0),
  reportCount: integer("report_count").notNull().default(0),
  /** LWW senkron sürümü. */
  version: integer("version").notNull().default(1),
  ...timestamps,
});

export const trustedContacts = pgTable(
  "trusted_contacts",
  {
    id: ulidPk(),
    userId: ulidRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 64 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 254 }),
    channel: contactChannelEnum("channel").notNull(),
    ...timestamps,
  },
  (t) => [index("trusted_contacts_user_idx").on(t.userId)],
);

export const devices = pgTable(
  "devices",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: ulidRef("user_id").references(() => users.id, { onDelete: "cascade" }),
    platform: platformEnum("platform").notNull(),
    pushToken: text("push_token"),
    appVersion: varchar("app_version", { length: 32 }),
    locale: localeEnum("locale").notNull().default("tr"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (t) => [index("devices_user_idx").on(t.userId)],
);
