import type { Database } from "@patika/db";
import { devices } from "@patika/db";
import { eq } from "drizzle-orm";

/** Expo Push: https://exp.host/--/api/v2/push/send . Jeton yoksa yalnız loglar. */
export async function notifyUser(
  db: Database,
  userId: string,
  msg: { title: string; body: string; data?: Record<string, unknown> },
): Promise<void> {
  const rows = await db
    .select({ token: devices.pushToken })
    .from(devices)
    .where(eq(devices.userId, userId));
  const tokens = rows.map((r) => r.token).filter((t): t is string => Boolean(t));
  if (tokens.length === 0) {
    console.log(`[push→${userId}] (jeton yok) ${msg.title}: ${msg.body}`);
    return;
  }
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(
      tokens.map((to) => ({
        to,
        title: msg.title,
        body: msg.body,
        data: msg.data,
        sound: "default",
        priority: "high",
      })),
    ),
  });
  if (!res.ok) console.error("Expo push hata:", res.status, await res.text());
}
