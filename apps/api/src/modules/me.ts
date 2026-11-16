import { devices, profiles, trustedContacts, users } from "@patika/db";
import { LOCALES, PLATFORMS, profileSchema, trustedContactSchema } from "@patika/shared";
import { eq, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";
import type { AppContext } from "../context";
import { authPlugin } from "../plugins/auth";

export const meModule = (ctx: AppContext) =>
  new Elysia({ prefix: "/me" })
    .use(authPlugin(ctx))
    .get(
      "/",
      async ({ user }) => {
        const [u] = await ctx.db
          .select({ id: users.id, email: users.email, phoneVerified: users.phoneVerifiedAt })
          .from(users)
          .where(eq(users.id, user.id));
        const [p] = await ctx.db.select().from(profiles).where(eq(profiles.userId, user.id));
        const contacts = await ctx.db
          .select()
          .from(trustedContacts)
          .where(eq(trustedContacts.userId, user.id));
        return { user: u, profile: p ?? null, contacts };
      },
      { auth: true },
    )
    /** Profil upsert (LWW: gelen version mevcut olandan büyük veya eşitse uygulanır). */
    .put(
      "/profile",
      async ({ user, body }) => {
        const { version, ...data } = body;
        const [existing] = await ctx.db
          .select({ version: profiles.version })
          .from(profiles)
          .where(eq(profiles.userId, user.id));
        if (existing && version < existing.version)
          return { applied: false, version: existing.version };
        const [row] = await ctx.db
          .insert(profiles)
          .values({ userId: user.id, ...data, version })
          .onConflictDoUpdate({
            target: profiles.userId,
            set: { ...data, version, updatedAt: sql`now()` },
          })
          .returning();
        return { applied: true, version: row?.version ?? version };
      },
      { auth: true, body: profileSchema.extend({ version: z.number().int().min(1).default(1) }) },
    )
    .put(
      "/contacts/:id",
      async ({ user, params, body }) => {
        await ctx.db
          .insert(trustedContacts)
          .values({ ...body, id: params.id, userId: user.id })
          .onConflictDoUpdate({
            target: trustedContacts.id,
            set: { ...body, updatedAt: sql`now()` },
          });
        return { ok: true };
      },
      { auth: true, body: trustedContactSchema.omit({ id: true }) },
    )
    .delete(
      "/contacts/:id",
      async ({ user, params }) => {
        await ctx.db
          .delete(trustedContacts)
          .where(
            sql`${trustedContacts.id} = ${params.id} and ${trustedContacts.userId} = ${user.id}`,
          );
        return { ok: true };
      },
      { auth: true },
    )
    /** Cihaz kaydı: push jetonu ve sürüm. */
    .put(
      "/devices/:id",
      async ({ user, params, body }) => {
        await ctx.db
          .insert(devices)
          .values({ id: params.id, userId: user.id, ...body })
          .onConflictDoUpdate({
            target: devices.id,
            set: { userId: user.id, ...body, lastSeenAt: sql`now()` },
          });
        return { ok: true };
      },
      {
        auth: true,
        body: z.object({
          platform: z.enum(PLATFORMS),
          pushToken: z.string().nullable().optional(),
          appVersion: z.string().max(32).optional(),
          locale: z.enum(LOCALES).default("tr"),
        }),
      },
    )
    /** Hesap silme (KVKK/GDPR): cascade ile tüm kişisel veri silinir. */
    .delete(
      "/",
      async ({ user }) => {
        await ctx.db.delete(users).where(eq(users.id, user.id));
        return { ok: true };
      },
      { auth: true },
    );
