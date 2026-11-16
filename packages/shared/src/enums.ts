/**
 * Alan (domain) sabitleri. Hem veritabanı enum'ları hem de mobil/API tarafı
 * aynı listeleri kullanır; buraya ekleme yapınca `packages/db` migration üretilmelidir.
 */

export const POI_TYPES = [
  "water", // çeşme, kaynak, dere
  "lodging", // pansiyon, otel, ev
  "camp", // kamp alanı
  "shop", // bakkal, market, restoran
  "transport", // dolmuş, taksi, otobüs durağı
  "signal", // mobil sinyal bulunan nokta
  "hazard", // tehlike, kapalı yol, heyelan
  "cache", // yürüyüşçülerin bıraktığı su/erzak
  "landmark", // antik kent, manzara, önemli kavşak
] as const;
export type PoiType = (typeof POI_TYPES)[number];

export const POI_REPORT_STATUSES = [
  "flowing", // su: akıyor
  "low", // su: az
  "dry", // su: kuru
  "open", // işletme: açık
  "closed", // işletme: kapalı
  "ok", // genel: yerinde ve kullanılabilir
  "damaged", // işaret/altyapı hasarlı
  "gone", // artık yok
] as const;
export type PoiReportStatus = (typeof POI_REPORT_STATUSES)[number];

export const NEED_KINDS = [
  "water", // 💧
  "food", // 🍎
  "power", // 🔋
  "firstaid", // 🩹
  "lost", // 🧭
  "gear", // 🥾
  "transport", // 🚕
  "lodging", // 🏕️
  "buddy", // 🤝
  "sos", // 🆘
] as const;
export type NeedKind = (typeof NEED_KINDS)[number];

export const NEED_EMOJI: Record<NeedKind, string> = {
  water: "💧",
  food: "🍎",
  power: "🔋",
  firstaid: "🩹",
  lost: "🧭",
  gear: "🥾",
  transport: "🚕",
  lodging: "🏕️",
  buddy: "🤝",
  sos: "🆘",
};

/** İhtiyaç türüne göre otomatik sona erme süresi (saat). */
export const NEED_TTL_HOURS: Record<NeedKind, number> = {
  water: 6,
  food: 12,
  power: 6,
  firstaid: 6,
  lost: 12,
  gear: 24,
  transport: 24,
  lodging: 24,
  buddy: 72,
  sos: 24,
};

/** İhtiyaç durum makinesi: open → offered → accepted → completed | expired | cancelled */
export const NEED_STATUSES = [
  "open",
  "offered",
  "accepted",
  "completed",
  "expired",
  "cancelled",
] as const;
export type NeedStatus = (typeof NEED_STATUSES)[number];

export const NEED_TRANSITIONS: Record<NeedStatus, readonly NeedStatus[]> = {
  open: ["offered", "expired", "cancelled"],
  offered: ["accepted", "open", "expired", "cancelled"],
  accepted: ["completed", "open", "cancelled"],
  completed: [],
  expired: [],
  cancelled: [],
};

export const OFFER_STATUSES = [
  "offered",
  "accepted",
  "declined",
  "withdrawn",
  "completed",
] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const HIKE_STATUSES = ["planned", "active", "arrived", "overdue", "cancelled"] as const;
export type HikeStatus = (typeof HIKE_STATUSES)[number];

export const CONTACT_CHANNELS = ["sms", "push", "email"] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export const EXPERIENCE_LEVELS = ["beginner", "intermediate", "experienced", "expert"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const AGE_BANDS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const BUSINESS_TIERS = ["free", "sponsored", "pro"] as const;
export type BusinessTier = (typeof BUSINESS_TIERS)[number];

export const FLAG_TARGETS = ["poi", "poi_report", "need", "user", "message"] as const;
export type FlagTarget = (typeof FLAG_TARGETS)[number];

export const PLATFORMS = ["ios", "android"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
