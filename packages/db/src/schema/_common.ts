import { char, timestamp } from "drizzle-orm/pg-core";

/** ULID birincil anahtar; istemci üretir, sunucu kabul eder. */
export const ulidPk = () => char("id", { length: 26 }).primaryKey();
export const ulidRef = (name: string) => char(name, { length: 26 });

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};
