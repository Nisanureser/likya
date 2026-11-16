import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://patika:patika@localhost:5432/patika",
  },
  // PostGIS'in kendi tablolarını (spatial_ref_sys) drizzle yönetmesin
  tablesFilter: ["!spatial_ref_sys"],
  extensionsFilters: ["postgis"],
  strict: true,
  verbose: true,
});
