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
    .use(openapi({ documentation: { info: { title: "Patika API", version: "0.1.0" } } }))
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
    .get("/health", async () => {
      await ctx.db.execute("select 1");
      return { ok: true, time: new Date().toISOString() };
    })
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
