import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default("postgres://patika:patika@localhost:5432/patika"),
  JWT_SECRET: z.string().min(16).default("dev-secret-change-me-please-32chars"),
  MAIL_PROVIDER: z.enum(["console", "resend"]).default("console"),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default("Patika <no-reply@example.com>"),
  TILES_BASE_URL: z.string().default("http://localhost:8080"),
  DATA_PACK_BASE_URL: z.string().default("http://localhost:8080/packs"),
  /** Arka plan işleri (gecikme kontrolü, ihtiyaç süresi dolma) — testte kapalı. */
  JOBS_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v !== "false"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    console.error("Geçersiz ortam değişkenleri:", z.treeifyError(parsed.error));
    process.exit(1);
  }
  if (parsed.data.NODE_ENV === "production" && parsed.data.JWT_SECRET.startsWith("dev-secret")) {
    throw new Error("Üretimde JWT_SECRET ayarlanmalı");
  }
  return parsed.data;
}
