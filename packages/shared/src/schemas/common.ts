import { z } from "zod";

/** ULID: istemci tarafında üretilir, sunucuda idempotent upsert anahtarıdır. */
export const ulidSchema = z.string().regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, "ULID bekleniyor");

export const lonLatSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

export const i18nTextSchema = z.record(z.string(), z.string().optional());

export const isoDateSchema = z.iso.datetime({ offset: true });
