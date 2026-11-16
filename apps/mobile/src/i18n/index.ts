/** Basit sözlük; i18n kütüphanesi tasarım turundan sonra seçilecek (TR + EN zorunlu). */
export const dict = {
  tr: {
    nextWater: "Sonraki su",
    nextLodging: "Sonraki konaklama",
    offTrack: "Rotadan uzaklaştın",
    arrived: "Vardım",
    emergency: "Acil durum",
    call112: "112'yi ara",
  },
  en: {
    nextWater: "Next water",
    nextLodging: "Next lodging",
    offTrack: "You left the trail",
    arrived: "I arrived",
    emergency: "Emergency",
    call112: "Call 112",
  },
} as const;
export type Locale = keyof typeof dict;
