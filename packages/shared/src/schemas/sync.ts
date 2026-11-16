import { z } from "zod";
import { isoDateSchema, ulidSchema } from "./common";

/**
 * Outbox kaydı. Mobil cihaz çevrimdışıyken yaptığı her değişikliği bu zarfla saklar
 * ve bağlantı gelince toplu gönderir. `entity` + `op` sunucuda ilgili işleyiciye yönlenir.
 */
export const syncEntitySchema = z.enum([
  "poi_report",
  "poi_suggestion",
  "need",
  "need_offer",
  "hike",
  "profile",
  "last_known",
]);
export type SyncEntity = z.infer<typeof syncEntitySchema>;

export const syncOpSchema = z.enum(["upsert", "delete"]);

export const outboxItemSchema = z.object({
  id: ulidSchema, // kaydın kendi kimliği (entity id)
  entity: syncEntitySchema,
  op: syncOpSchema,
  /** Kullanıcıya ait tekil kayıtlarda LWW için; olay kayıtlarında 1. */
  version: z.number().int().min(1),
  /** Cihaz saati; sunucu bunu `device_created_at` olarak saklar, kendi saatini ayrıca yazar. */
  deviceUpdatedAt: isoDateSchema,
  payload: z.record(z.string(), z.unknown()),
});
export type OutboxItem = z.infer<typeof outboxItemSchema>;

export const syncPushRequestSchema = z.object({
  deviceId: z.string().min(8).max(64),
  items: z.array(outboxItemSchema).max(500),
});
export type SyncPushRequest = z.infer<typeof syncPushRequestSchema>;

export const syncPushResultSchema = z.object({
  id: ulidSchema,
  status: z.enum(["applied", "ignored_stale", "rejected"]),
  reason: z.string().optional(),
  /** Sunucunun kabul ettiği güncel sürüm (LWW kayıtlarında). */
  version: z.number().int().optional(),
});

export const syncPushResponseSchema = z.object({
  results: z.array(syncPushResultSchema),
  serverTime: isoDateSchema,
});
export type SyncPushResponse = z.infer<typeof syncPushResponseSchema>;

export const syncPullRequestSchema = z.object({
  trail: z.string(),
  /** Son başarılı pull'un `serverTime` değeri; yoksa tam indirme. */
  since: isoDateSchema.optional(),
});
