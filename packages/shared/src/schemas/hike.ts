import { z } from "zod";
import { CONTACT_CHANNELS, HIKE_STATUSES } from "../enums";
import { isoDateSchema, lonLatSchema, ulidSchema } from "./common";

export const hikeSchema = z.object({
  id: ulidSchema,
  trail: z.string(),
  startStageSeq: z.number().int().min(1),
  endStageSeq: z.number().int().min(1),
  plannedStart: isoDateSchema,
  /** Varış onayı beklenen zaman. Geçilirse önce kullanıcıya, sonra kişiye bildirim. */
  plannedEta: isoDateSchema,
  status: z.enum(HIKE_STATUSES).default("planned"),
  trustedContactIds: z.array(ulidSchema).max(3).default([]),
  version: z.number().int().min(1).default(1),
});
export type HikeInput = z.infer<typeof hikeSchema>;

export const trustedContactSchema = z.object({
  id: ulidSchema,
  name: z.string().min(1).max(64),
  phone: z.string().min(6).max(20).nullable().optional(),
  email: z.email().nullable().optional(),
  channel: z.enum(CONTACT_CHANNELS),
});
export type TrustedContactInput = z.infer<typeof trustedContactSchema>;

/** Son bilinen konum: çevrimdışıyken cihazda, sinyalde sunucuya. Hassas konum, yalnız sahibi ve rızayla arama-kurtarma. */
export const lastKnownSchema = z.object({
  hikeId: ulidSchema.nullable().optional(),
  location: lonLatSchema,
  accuracyM: z.number().min(0).nullable().optional(),
  batteryPct: z.number().min(0).max(100).nullable().optional(),
  recordedAt: isoDateSchema,
});
export type LastKnownInput = z.infer<typeof lastKnownSchema>;
