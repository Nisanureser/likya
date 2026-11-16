import { jwt } from "@elysiajs/jwt";
import { users } from "@patika/db";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import type { AppContext } from "../context";

export interface AuthUser {
  id: string;
  isAdmin: boolean;
}

/**
 * JWT doğrulama. Kullanım: route seçeneklerinde `{ auth: true }` verince `user` bağlama girer.
 * Erişim jetonu 30 gün geçerli; MVP'de yenileme jetonu yok (çıkış = jetonu sil).
 */
export const authPlugin = (ctx: AppContext) =>
  new Elysia({ name: "auth" })
    .use(jwt({ name: "jwt", secret: ctx.env.JWT_SECRET, exp: "30d" }))
    .macro({
      auth: {
        async resolve({ jwt, headers, status }) {
          const header = headers.authorization ?? "";
          const token = header.startsWith("Bearer ") ? header.slice(7) : null;
          if (!token) return status(401, { error: "unauthorized" });
          const payload = await jwt.verify(token);
          if (!payload || typeof payload.sub !== "string")
            return status(401, { error: "invalid_token" });
          const [u] = await ctx.db
            .select({ id: users.id, isAdmin: users.isAdmin, bannedAt: users.bannedAt })
            .from(users)
            .where(eq(users.id, payload.sub))
            .limit(1);
          if (!u) return status(401, { error: "unknown_user" });
          if (u.bannedAt) return status(403, { error: "banned" });
          const user: AuthUser = { id: u.id, isAdmin: u.isAdmin };
          return { user };
        },
      },
    });
