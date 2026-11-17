import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import type { AppContext } from "./context";
import { authModule } from "./modules/auth";
import { hikesModule } from "./modules/hikes";
import { meModule } from "./modules/me";
import { needsModule } from "./modules/needs";
import { presenceModule } from "./modules/presence";
import { reportsModule } from "./modules/reports";
import { syncModule } from "./modules/sync";
import { trailsModule } from "./modules/trails";

export function createApp(ctx: AppContext) {
  return new Elysia()
    .use(cors())
    .use(
      openapi({
        documentation: {
          info: {
            title: "Patika API",
            version: "0.1.0",
            description:
              "Likya Yolu yürüyüşçü dayanışma uygulaması. Yazma uçları `Authorization: Bearer <jwt>` ister (jeton: /auth/verify). Başkalarına yalnız 250 m hücreye yuvarlanmış konum döner.",
          },
          tags: [
            { name: "Sistem", description: "Sağlık kontrolü" },
            { name: "Kimlik", description: "E-posta kodu ile giriş; Apple/Google sonra" },
            { name: "Ben", description: "Profil, güvenilir kişiler, cihazlar, hesap" },
            { name: "Rota", description: "Rotalar, etaplar, POI'ler, sonraki su" },
            { name: "POI raporu", description: "Çeşme kuru / pansiyon açık gibi durum raporları" },
            { name: "İhtiyaç", description: "Etap panosu: ihtiyaç ilanı, teklif, durum makinesi" },
            { name: "Güvenlik", description: "Yürüyüş planı, vardım onayı, son bilinen konum" },
            {
              name: "Canlı harita",
              description: "Çevrimiçiyken yakındaki yürüyüşçüler (kabalaştırılmış)",
            },
            { name: "Senkron", description: "Çevrimdışı outbox gönderimi ve delta çekme" },
          ],
        },
      }),
    )
    .onError(({ code, error, set }) => {
      if (code === "VALIDATION") {
        set.status = 422;
        return { error: "validation", detail: String(error.message).slice(0, 500) };
      }
      if (code === "NOT_FOUND") return { error: "not_found" };
      console.error(error);
      set.status = 500;
      return { error: "internal" };
    })
    .get(
      "/health",
      async () => {
        await ctx.db.execute("select 1");
        return { ok: true, time: new Date().toISOString() };
      },
      { detail: { tags: ["Sistem"], summary: "Sağlık kontrolü" } },
    )
    .use(authModule(ctx))
    .use(meModule(ctx))
    .use(trailsModule(ctx))
    .use(reportsModule(ctx))
    .use(needsModule(ctx))
    .use(hikesModule(ctx))
    .use(presenceModule(ctx))
    .use(syncModule(ctx));
}

export type App = ReturnType<typeof createApp>;
