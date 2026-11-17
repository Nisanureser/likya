import { authCodes, profiles, users } from "@patika/db";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { ulid } from "ulid";
import { z } from "zod";
import type { AppContext } from "../context";
import { authPlugin } from "../plugins/auth";

const CODE_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

function randomCode(): string {
  // 6 haneli, baştaki sıfırlar korunur
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

async function hashCode(email: string, code: string): Promise<string> {
  const h = new Bun.CryptoHasher("sha256");
  h.update(`${email.toLowerCase()}:${code}`);
  return h.digest("hex");
}

export const authModule = (ctx: AppContext) =>
  new Elysia({ prefix: "/auth", tags: ["Kimlik"] })
    .use(authPlugin(ctx))
    /** E-posta ile tek kullanımlık kod iste. Geliştirmede kod konsola yazılır. */
    .post(
      "/request-code",
      async ({ body }) => {
        const email = body.email.toLowerCase().trim();
        // Oran sınırı: son 10 dakikada en fazla 3 kod
        const recent = await ctx.db
          .select({ n: sql<number>`count(*)` })
          .from(authCodes)
          .where(
            and(
              eq(authCodes.email, email),
              gt(authCodes.createdAt, new Date(Date.now() - 10 * 60_000)),
            ),
          );
        if (Number(recent[0]?.n ?? 0) >= 3) return { ok: true, throttled: true };

        const code = randomCode();
        await ctx.db.insert(authCodes).values({
          id: ulid(),
          email,
          codeHash: await hashCode(email, code),
          expiresAt: new Date(Date.now() + CODE_TTL_MIN * 60_000),
        });
        await ctx.mailer.send(
          email,
          "Patika giriş kodun",
          `Giriş kodun: ${code}\n${CODE_TTL_MIN} dakika geçerli.`,
        );
        return { ok: true, throttled: false };
      },
      {
        detail: { summary: "E-posta ile tek kullanımlık kod iste" },
        body: z.object({ email: z.email() }),
      },
    )
    /** Kodu doğrula; kullanıcı yoksa oluştur; JWT döndür. */
    .post(
      "/verify",
      async ({ body, jwt, status }) => {
        const email = body.email.toLowerCase().trim();
        const [rec] = await ctx.db
          .select()
          .from(authCodes)
          .where(
            and(
              eq(authCodes.email, email),
              isNull(authCodes.consumedAt),
              gt(authCodes.expiresAt, new Date()),
            ),
          )
          .orderBy(desc(authCodes.createdAt))
          .limit(1);
        if (!rec) return status(400, { error: "code_expired" });
        if (rec.attempts >= MAX_ATTEMPTS) return status(429, { error: "too_many_attempts" });
        if (rec.codeHash !== (await hashCode(email, body.code))) {
          await ctx.db
            .update(authCodes)
            .set({ attempts: rec.attempts + 1 })
            .where(eq(authCodes.id, rec.id));
          return status(400, { error: "code_invalid" });
        }
        await ctx.db
          .update(authCodes)
          .set({ consumedAt: new Date() })
          .where(eq(authCodes.id, rec.id));

        let [user] = await ctx.db
          .select()
          .from(users)
          .where(eq(sql`lower(${users.email})`, email))
          .limit(1);
        let isNew = false;
        if (!user) {
          isNew = true;
          [user] = await ctx.db.insert(users).values({ id: ulid(), email }).returning();
        }
        if (!user) return status(500, { error: "user_create_failed" });
        const [profile] = await ctx.db
          .select()
          .from(profiles)
          .where(eq(profiles.userId, user.id))
          .limit(1);
        const token = await jwt.sign({ sub: user.id });
        return { token, userId: user.id, isNew, hasProfile: Boolean(profile) };
      },
      {
        detail: { summary: "Kodu doğrula, giriş jetonu al" },
        body: z.object({ email: z.email(), code: z.string().length(6) }),
      },
    )
    /**
     * Apple / Google ile giriş — iskelet. Üretimde kimlik jetonu sağlayıcının anahtarlarıyla
     * doğrulanmalı (apple: appleid.apple.com/auth/keys, google: tokeninfo). Şimdilik 501.
     */
    .post(
      "/oauth/:provider",
      ({ params, status }) => status(501, { error: `${params.provider} henüz uygulanmadı` }),
      { detail: { summary: "Apple/Google ile giriş (henüz yok)" } },
    );
