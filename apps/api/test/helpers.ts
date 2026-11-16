import { createApp } from "../src/app";
import { createContext } from "../src/context";
import { loadEnv } from "../src/env";
import type { Mailer } from "../src/services/mail";

/** Testler yerel Postgres'e bağlanır (DATABASE_URL). E-postalar yakalanır. */
export function makeTestApp() {
  const sent: Array<{ to: string; subject: string; text: string }> = [];
  const mailer: Mailer = {
    async send(to, subject, text) {
      sent.push({ to, subject, text });
    },
  };
  const env = loadEnv({ ...process.env, NODE_ENV: "test", JOBS_ENABLED: "false" });
  const ctx = createContext(env, { mailer });
  const app = createApp(ctx);
  const api = (path: string, init: RequestInit = {}) =>
    app.handle(new Request(`http://local${path}`, init));
  const json = (path: string, body: unknown, token?: string, method = "POST") =>
    api(path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

  async function login(email: string): Promise<string> {
    const r1 = await json("/auth/request-code", { email });
    if (!r1.ok) throw new Error(`request-code ${r1.status}`);
    const last = sent.at(-1);
    const code = last?.text.match(/(\d{6})/)?.[1];
    if (!code) throw new Error("kod e-postada bulunamadı");
    const r2 = await json("/auth/verify", { email, code });
    const data = (await r2.json()) as { token: string };
    if (!data.token) throw new Error(`verify ${r2.status} ${JSON.stringify(data)}`);
    return data.token;
  }
  return { app, ctx, api, json, login, sent };
}
