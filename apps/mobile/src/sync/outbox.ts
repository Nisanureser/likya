import type { OutboxItem, SyncEntity } from "@patika/shared";
import { ulid } from "ulid";
import { openDatabase } from "@/db/client";

/**
 * Outbox: çevrimdışı yapılan her değişiklik önce buraya yazılır.
 * Senkron motoru bağlantı gelince toplu gönderir; sunucu idempotent kabul eder.
 */
export function enqueue(
  entity: SyncEntity,
  payload: Record<string, unknown>,
  opts: { id?: string; version?: number; op?: "upsert" | "delete" } = {},
): string {
  const db = openDatabase();
  const id = opts.id ?? ulid();
  db.runSync(
    "INSERT OR REPLACE INTO outbox(id, entity, op, version, device_updated_at, payload) VALUES (?,?,?,?,?,?)",
    [
      id,
      entity,
      opts.op ?? "upsert",
      opts.version ?? 1,
      new Date().toISOString(),
      JSON.stringify(payload),
    ],
  );
  return id;
}

export function pending(limit = 200): OutboxItem[] {
  const db = openDatabase();
  const rows = db.getAllSync<{
    id: string;
    entity: SyncEntity;
    op: "upsert" | "delete";
    version: number;
    device_updated_at: string;
    payload: string;
  }>(
    "SELECT id, entity, op, version, device_updated_at, payload FROM outbox ORDER BY created_at LIMIT ?",
    [limit],
  );
  return rows.map((r) => ({
    id: r.id,
    entity: r.entity,
    op: r.op,
    version: r.version,
    deviceUpdatedAt: r.device_updated_at,
    payload: JSON.parse(r.payload),
  }));
}

export function markDone(id: string, version: number) {
  openDatabase().runSync("DELETE FROM outbox WHERE id=? AND version=?", [id, version]);
}

export function markFailed(id: string, version: number, error: string) {
  openDatabase().runSync(
    "UPDATE outbox SET attempts=attempts+1, last_error=? WHERE id=? AND version=?",
    [error.slice(0, 200), id, version],
  );
}

export function pendingCount(): number {
  return openDatabase().getFirstSync<{ n: number }>("SELECT count(*) as n FROM outbox")?.n ?? 0;
}
