import { createApp } from "./app";
import { createContext } from "./context";
import { loadEnv } from "./env";
import { startJobs } from "./jobs/scheduler";

const env = loadEnv();
const ctx = createContext(env);
const app = createApp(ctx).listen(env.PORT);
if (env.JOBS_ENABLED) startJobs(ctx);
console.log(`Patika API: http://localhost:${env.PORT}  (OpenAPI: /openapi)`);

export type { App } from "./app";
export { app };
