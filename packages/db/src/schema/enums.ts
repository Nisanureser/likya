import {
  AGE_BANDS,
  BUSINESS_TIERS,
  CONTACT_CHANNELS,
  EXPERIENCE_LEVELS,
  FLAG_TARGETS,
  HIKE_STATUSES,
  LOCALES,
  NEED_KINDS,
  NEED_STATUSES,
  OFFER_STATUSES,
  PLATFORMS,
  POI_REPORT_STATUSES,
  POI_TYPES,
} from "@patika/shared";
import { pgEnum } from "drizzle-orm/pg-core";

// pgEnum tuple tipi ister; readonly dizileri kopyalıyoruz.
const tuple = <T extends readonly [string, ...string[]]>(a: T) => [...a] as unknown as T;

export const poiTypeEnum = pgEnum("poi_type", tuple(POI_TYPES));
export const poiReportStatusEnum = pgEnum("poi_report_status", tuple(POI_REPORT_STATUSES));
export const needKindEnum = pgEnum("need_kind", tuple(NEED_KINDS));
export const needStatusEnum = pgEnum("need_status", tuple(NEED_STATUSES));
export const offerStatusEnum = pgEnum("offer_status", tuple(OFFER_STATUSES));
export const hikeStatusEnum = pgEnum("hike_status", tuple(HIKE_STATUSES));
export const contactChannelEnum = pgEnum("contact_channel", tuple(CONTACT_CHANNELS));
export const experienceEnum = pgEnum("experience_level", tuple(EXPERIENCE_LEVELS));
export const ageBandEnum = pgEnum("age_band", tuple(AGE_BANDS));
export const businessTierEnum = pgEnum("business_tier", tuple(BUSINESS_TIERS));
export const flagTargetEnum = pgEnum("flag_target", tuple(FLAG_TARGETS));
export const platformEnum = pgEnum("platform", tuple(PLATFORMS));
export const localeEnum = pgEnum("locale", tuple(LOCALES));
