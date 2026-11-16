import { createDb, type Database } from "@patika/db";
import type { Env } from "./env";
import { createMailer, type Mailer } from "./services/mail";

/** Uygulama bağımlılıkları; testlerde değiştirilebilir. */
export interface AppContext {
  env: Env;
  db: Database;
  mailer: Mailer;
}

export function createContext(env: Env, overrides: Partial<AppContext> = {}): AppContext {
  return {
    env,
    db: overrides.db ?? createDb(env.DATABASE_URL),
    mailer: overrides.mailer ?? createMailer(env),
  };
}
