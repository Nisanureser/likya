import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

/** Yerel veritabanı: çevrimdışı POI/etap önbelleği + outbox. Şema sürümlü. */
export function openDatabase(): SQLite.SQLiteDatabase {
  if (db) return db;
  db = SQLite.openDatabaseSync("patika.db");
  db.execSync("PRAGMA journal_mode = WAL;");
  migrate(db);
  return db;
}

const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
  CREATE TABLE IF NOT EXISTS stages (
    id TEXT PRIMARY KEY, trail TEXT NOT NULL, seq INTEGER NOT NULL, name TEXT NOT NULL,
    distance_m INTEGER NOT NULL, cum_start_m INTEGER NOT NULL, line TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS pois (
    id TEXT PRIMARY KEY, trail TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL,
    lon REAL NOT NULL, lat REAL NOT NULL, stage_id TEXT, trail_offset_m INTEGER,
    distance_from_track_m INTEGER, is_paid INTEGER NOT NULL DEFAULT 0,
    derived TEXT, seasonality TEXT, contact TEXT, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX IF NOT EXISTS pois_trail_offset ON pois(trail, trail_offset_m);
  CREATE TABLE IF NOT EXISTS needs (
    id TEXT PRIMARY KEY, trail TEXT NOT NULL, user_id TEXT, kind TEXT NOT NULL, note TEXT,
    status TEXT NOT NULL, lon REAL, lat REAL, stage_id TEXT, expires_at TEXT NOT NULL,
    updated_at TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, nickname TEXT, mine INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS hikes (
    id TEXT PRIMARY KEY, data TEXT NOT NULL, version INTEGER NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS track_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT, hike_id TEXT, lon REAL NOT NULL, lat REAL NOT NULL,
    accuracy_m REAL, altitude_m REAL, speed_mps REAL, recorded_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS outbox (
    id TEXT NOT NULL, entity TEXT NOT NULL, op TEXT NOT NULL, version INTEGER NOT NULL,
    device_updated_at TEXT NOT NULL, payload TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    PRIMARY KEY (id, version)
  );
  `,
];

function migrate(d: SQLite.SQLiteDatabase) {
  d.execSync("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);");
  const cur = Number(
    d.getFirstSync<{ value: string }>("SELECT value FROM meta WHERE key='schema_version'")?.value ??
      0,
  );
  for (let i = cur; i < MIGRATIONS.length; i++) {
    d.execSync(MIGRATIONS[i]!);
    d.runSync("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', ?)", [
      String(i + 1),
    ]);
  }
}
