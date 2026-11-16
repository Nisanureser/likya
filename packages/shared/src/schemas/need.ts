import { z } from "zod";
import { NEED_KINDS, NEED_STATUSES, OFFER_STATUSES } from "../enums";
import { isoDateSchema, lonLatSchema, ulidSchema } from "./common";

export const needCreateSchema = z.object({
  id: ulidSchema,
  trail: z.string(),
  stageSeq: z.number().int().min(1).nullable().optional(),
  kind: z.enum(NEED_KINDS),
  note: z.string().max(500).nullable().optional(),
  photoKey: z.string().max(200).nullable().optional(),
  /** Ham konum; sunucu kabalaştırıp saklar. SOS'ta hassas konum ayrı alanda tutulur. */
  location: lonLatSchema.nullable().optional(),
  /** Ücretli hizmet talebi mi (ör. transfer)? Dayanışma akışından ayrılır. */
  paidOk: z.boolean().default(false),
  deviceCreatedAt: isoDateSchema,
});
export type NeedCreate = z.infer<typeof needCreateSchema>;

export const needStatusUpdateSchema = z.object({
  status: z.enum(NEED_STATUSES),
});

export const offerCreateSchema = z.object({
  id: ulidSchema,
  needId: ulidSchema,
  message: z.string().max(300).nullable().optional(),
  deviceCreatedAt: isoDateSchema,
});
export type OfferCreate = z.infer<typeof offerCreateSchema>;

export const offerStatusUpdateSchema = z.object({
  status: z.enum(OFFER_STATUSES),
});
