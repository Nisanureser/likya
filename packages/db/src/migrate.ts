import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL ?? "postgres://patika:patika@localhost:5432/patika";
const client = postgres(url, { max: 1 });
const db = drizzle(client);

// drizzle-kit uzantı oluşturmaz; migration'lardan önce PostGIS'i garanti ederiz.
await client`CREATE EXTENSION IF NOT EXISTS postgis`;
await migrate(db, { migrationsFolder: new URL("../drizzle", import.meta.url).pathname });
console.log("migrations applied");
await client.end();
