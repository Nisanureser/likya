import type { I18nText, PoiReportStatus } from "@patika/shared";
import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { geoLine, geoPoint } from "../geometry";
import { timestamps, ulidPk, ulidRef } from "./_common";
import { businesses } from "./businesses";
import { poiTypeEnum } from "./enums";
import { users } from "./users";

export const trails = pgTable("trails", {
  id: ulidPk(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: jsonb("name").$type<I18nText>().notNull(),
  description: jsonb("description").$type<I18nText>(),
  /** Veri paketi sürümü; mobil bu değeri görünce yeni paket indirir. */
  dataVersion: varchar("data_version", { length: 32 }).notNull().default("0"),
  /** [minLon, minLat, maxLon, maxLat] */
  bbox: doublePrecision("bbox").array(),
  lengthM: integer("length_m"),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const stages = pgTable(
  "stages",
  {
    id: ulidPk(),
    trailId: ulidRef("trail_id")
      .notNull()
      .references(() => trails.id, { onDelete: "cascade" }),
    seq: integer("seq").notNull(),
    name: jsonb("name").$type<I18nText>().notNull(),
    startName: jsonb("start_name").$type<I18nText>(),
    endName: jsonb("end_name").$type<I18nText>(),
    distanceM: integer("distance_m").notNull(),
    ascentM: integer("ascent_m"),
    descentM: integer("descent_m"),
    /** Rota başından bu etabın başına kadar metre (kümülatif). */
    cumStartM: integer("cum_start_m").notNull(),
    track: geoLine("track").notNull(),
    notes: jsonb("notes").$type<I18nText>(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("stages_trail_seq_uq").on(t.trailId, t.seq),
    index("stages_track_gix").using("gist", t.track),
  ],
);

export const pois = pgTable(
  "pois",
  {
    id: ulidPk(),
    trailId: ulidRef("trail_id")
      .notNull()
      .references(() => trails.id, { onDelete: "cascade" }),
    type: poiTypeEnum("type").notNull(),
    name: jsonb("name").$type<I18nText>().notNull(),
    description: jsonb("description").$type<I18nText>(),
    geom: geoPoint("geom").notNull(),
    /** En yakın etap ve o etap içindeki patika ofseti; eklenince hesaplanır. */
    stageId: ulidRef("stage_id").references(() => stages.id, { onDelete: "set null" }),
    trackOffsetM: integer("track_offset_m"),
    /** Rota başından patika boyunca metre: "sonraki suya X km" bu alandan. */
    trailOffsetM: integer("trail_offset_m"),
    /** Rota çizgisine dik uzaklık (metre); rotadan uzak POI'ler ayrı listelenir. */
    distanceFromTrackM: integer("distance_from_track_m"),
    isPaid: boolean("is_paid").notNull().default(false),
    businessId: ulidRef("business_id").references(() => businesses.id, { onDelete: "set null" }),
    /** Mevsimsel bilgi (ör. su: "Haziran–Ekim genelde kuru"). */
    seasonality: jsonb("seasonality").$type<I18nText>(),
    contact: jsonb("contact").$type<{ phone?: string; whatsapp?: string; web?: string }>(),
    /** Son raporlardan türetilen özet; poi_reports eklendikçe yeniden hesaplanır. */
    derived: jsonb("derived")
      .$type<{
        status: PoiReportStatus | null;
        lastReportAt: string | null;
        reportCount30d: number;
        confidence: number; // 0..1
      }>()
      .notNull()
      .default({ status: null, lastReportAt: null, reportCount30d: 0, confidence: 0 }),
    createdBy: ulidRef("created_by").references(() => users.id, { onDelete: "set null" }),
    /** Moderasyon: öneriden gelenler onaylanana kadar yayında değildir. */
    isPublished: boolean("is_published").notNull().default(true),
    /** Kaynak: "osm", "society", "user", "seed" */
    source: varchar("source", { length: 32 }).notNull().default("seed"),
    sourceRef: varchar("source_ref", { length: 128 }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("pois_trail_type_idx").on(t.trailId, t.type),
    index("pois_geom_gix").using("gist", t.geom),
    index("pois_updated_idx").on(t.updatedAt),
    index("pois_trail_offset_idx").on(t.trailId, t.trailOffsetM),
  ],
);

/** Kullanıcıdan gelen yeni nokta önerisi; onaylanınca `pois` tablosuna kopyalanır. */
export const poiSuggestions = pgTable(
  "poi_suggestions",
  {
    id: ulidPk(),
    trailId: ulidRef("trail_id")
      .notNull()
      .references(() => trails.id, { onDelete: "cascade" }),
    userId: ulidRef("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: poiTypeEnum("type").notNull(),
    name: jsonb("name").$type<I18nText>().notNull(),
    geom: geoPoint("geom").notNull(),
    note: text("note"),
    photoKey: varchar("photo_key", { length: 200 }),
    quantity: varchar("quantity", { length: 50 }),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    deviceCreatedAt: timestamp("device_created_at", { withTimezone: true }).notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: ulidRef("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    approvedPoiId: ulidRef("approved_poi_id").references(() => pois.id, { onDelete: "set null" }),
    rejectReason: text("reject_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("poi_suggestions_pending_idx").on(t.trailId, t.reviewedAt)],
);

export const _trailsSqlNote = sql`-- PostGIS GiST indeksleri stages.track ve pois.geom üzerinde`;
