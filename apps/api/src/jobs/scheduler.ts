import { presence } from "@patika/db";
import { lt } from "drizzle-orm";
import type { AppContext } from "../context";
import { checkOverdueHikes } from "../services/hikes";
import { expireNeeds } from "../services/needs";

/**
 * Basit dakikalık zamanlayıcı. Tek API örneği varsayar; birden fazla örnekte
 * (ileride) pg advisory lock ya da ayrı bir worker gerekir.
 */
export function startJobs(ctx: AppContext): () => void {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const expired = await expireNeeds(ctx.db);
      const overdue = await checkOverdueHikes(ctx.db, ctx.mailer);
      await ctx.db.delete(presence).where(lt(presence.expiresAt, new Date()));
      if (expired || overdue.reminded || overdue.notified)
        console.log("[jobs]", { expired, ...overdue });
    } catch (e) {
      console.error("[jobs] hata", e);
    } finally {
      running = false;
    }
  };
  const handle = setInterval(tick, 60_000);
  void tick();
  return () => clearInterval(handle);
}
