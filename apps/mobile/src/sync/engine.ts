import { DEFAULT_TRAIL_SLUG } from "@patika/shared";
import NetInfo from "@react-native-community/netinfo";
import { api } from "@/api/client";
import { getDeviceId } from "@/api/device";
import { openDatabase } from "@/db/client";
import { useSyncStore } from "@/store/sync";
import { markDone, markFailed, pending } from "./outbox";

let inFlight = false;

/**
 * Senkron döngüsü:
 *  - bağlantı değişiminde ve her 5 dakikada bir (yalnız çevrimiçiyken) push + pull
 *  - çevrimdışıyken hiçbir ağ denemesi yapılmaz (pil)
 *  - rejected kayıtlar outbox'ta kalır ve kullanıcıya gösterilir (attempts/last_error)
 */
export function startSyncLoop(): () => void {
  const unsub = NetInfo.addEventListener((state) => {
    useSyncStore
      .getState()
      .setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    if (state.isConnected) void syncNow();
  });
  const timer = setInterval(() => {
    if (useSyncStore.getState().online) void syncNow();
  }, 5 * 60_000);
  return () => {
    unsub();
    clearInterval(timer);
  };
}

export async function syncNow(): Promise<void> {
  if (inFlight) return;
  inFlight = true;
  const store = useSyncStore.getState();
  store.setSyncing(true);
  try {
    await pushOutbox();
    await pullDelta();
    store.setLastSync(new Date().toISOString());
  } catch (e) {
    store.setError(e instanceof Error ? e.message : String(e));
  } finally {
    store.setSyncing(false);
    inFlight = false;
  }
}

async function pushOutbox() {
  const items = pending();
  if (items.length === 0) return;
  const res = await api.syncPush({ deviceId: await getDeviceId(), items });
  for (const r of res.results) {
    const item = items.find((i) => i.id === r.id);
    if (!item) continue;
    if (r.status === "applied" || r.status === "ignored_stale") markDone(item.id, item.version);
    else markFailed(item.id, item.version, r.reason ?? "rejected");
  }
}

async function pullDelta(trail = DEFAULT_TRAIL_SLUG) {
  const db = openDatabase();
  const since = db.getFirstSync<{ value: string }>("SELECT value FROM meta WHERE key=?", [
    `last_pull:${trail}`,
  ])?.value;
  const res = await api.syncPull({ trail, since, deviceId: await getDeviceId() });
  db.withTransactionSync(() => {
    for (const p of res.pois) {
      db.runSync(
        `INSERT OR REPLACE INTO pois(id, trail, type, name, lon, lat, stage_id, trail_offset_m, distance_from_track_m, is_paid, derived, seasonality, contact, updated_at, deleted_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          p.id,
          trail,
          p.type,
          JSON.stringify(p.name),
          p.geom[0],
          p.geom[1],
          p.stageId,
          p.trailOffsetM,
          p.distanceFromTrackM,
          p.isPaid ? 1 : 0,
          JSON.stringify(p.derived),
          JSON.stringify(p.seasonality ?? null),
          JSON.stringify(p.contact ?? null),
          p.updatedAt,
          p.deletedAt,
        ],
      );
    }
    for (const n of res.needs) {
      db.runSync(
        `INSERT OR REPLACE INTO needs(id, trail, user_id, kind, note, status, lon, lat, stage_id, expires_at, updated_at, version, nickname, mine)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          n.id,
          trail,
          n.userId,
          n.kind,
          n.note,
          n.status,
          n.location?.[0] ?? null,
          n.location?.[1] ?? null,
          n.stageId,
          n.expiresAt,
          n.updatedAt,
          n.version,
          n.nickname,
          0,
        ],
      );
    }
    for (const h of res.hikes) {
      db.runSync("INSERT OR REPLACE INTO hikes(id, data, version, updated_at) VALUES (?,?,?,?)", [
        h.id,
        JSON.stringify(h),
        h.version,
        h.updatedAt,
      ]);
    }
    db.runSync("INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)", [
      `last_pull:${trail}`,
      res.serverTime,
    ]);
    db.runSync("INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)", [
      `data_version:${trail}`,
      res.dataVersion,
    ]);
  });
}
