import { z } from "zod";
import { POI_REPORT_STATUSES, POI_TYPES } from "../enums";
import { i18nTextSchema, isoDateSchema, lonLatSchema, ulidSchema } from "./common";

/** Var olan bir POI için durum raporu (olay; asla güncellenmez). */
export const poiReportSchema = z.object({
  id: ulidSchema,
  poiId: ulidSchema,
  status: z.enum(POI_REPORT_STATUSES),
  note: z.string().max(500).nullable().optional(),
  photoKey: z.string().max(200).nullable().optional(),
  /** Gözlem anı (cihaz saati). */
  observedAt: isoDateSchema,
  /** Rapor verenin o anki konumu; POI'den uzaksa güven puanı düşer. */
  location: lonLatSchema.nullable().optional(),
});
export type PoiReportInput = z.infer<typeof poiReportSchema>;

/** Yeni POI önerisi (ör. "buraya su bıraktım"). Moderasyon sonrası POI olur. */
export const poiSuggestionSchema = z.object({
  id: ulidSchema,
  trail: z.string(),
  type: z.enum(POI_TYPES),
  name: i18nTextSchema,
  location: lonLatSchema,
  note: z.string().max(500).nullable().optional(),
  photoKey: z.string().max(200).nullable().optional(),
  /** cache türü için: miktar ve tahmini tükenme. */
  quantity: z.string().max(50).nullable().optional(),
  observedAt: isoDateSchema,
});
export type PoiSuggestionInput = z.infer<typeof poiSuggestionSchema>;
