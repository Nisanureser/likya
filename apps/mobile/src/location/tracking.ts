import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { openDatabase } from "@/db/client";
import { enqueue } from "@/sync/outbox";

export const TRACKING_TASK = "patika.tracking";

/**
 * Arka plan konum görevi. İskelet:
 *  - noktaları SQLite'a yazar (sunucuya iz gönderilmez)
 *  - her 10 dakikada bir "last_known" outbox kaydı üretir (güvenlik)
 * Pil stratejisi (adaptif örnekleme, hareketsizken duraklatma, native modül) teknik
 * deneme fazında kararlaştırılacak; bkz. docs/mimari.md.
 */
TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  TRACKING_TASK,
  async ({ data, error }) => {
    if (error || !data) return;
    const db = openDatabase();
    const hikeId =
      db.getFirstSync<{ value: string }>("SELECT value FROM meta WHERE key='active_hike'")?.value ??
      null;
    for (const l of data.locations) {
      db.runSync(
        "INSERT INTO track_points(hike_id, lon, lat, accuracy_m, altitude_m, speed_mps, recorded_at) VALUES (?,?,?,?,?,?,?)",
        [
          hikeId,
          l.coords.longitude,
          l.coords.latitude,
          l.coords.accuracy,
          l.coords.altitude,
          l.coords.speed,
          new Date(l.timestamp).toISOString(),
        ],
      );
    }
    const last = data.locations.at(-1);
    const lastSent = Number(
      db.getFirstSync<{ value: string }>("SELECT value FROM meta WHERE key='last_known_sent_at'")
        ?.value ?? 0,
    );
    if (last && Date.now() - lastSent > 10 * 60_000) {
      enqueue("last_known", {
        hikeId,
        location: [last.coords.longitude, last.coords.latitude],
        accuracyM: last.coords.accuracy,
        recordedAt: new Date(last.timestamp).toISOString(),
      });
      db.runSync("INSERT OR REPLACE INTO meta(key, value) VALUES ('last_known_sent_at', ?)", [
        String(Date.now()),
      ]);
    }
  },
);

export async function startTracking(): Promise<boolean> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") return false;
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== "granted") return false;
  await Location.startLocationUpdatesAsync(TRACKING_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 30, // metre; yürüyüşte ~30 sn'de bir
    timeInterval: 60_000,
    deferredUpdatesInterval: 120_000,
    deferredUpdatesDistance: 100,
    pausesUpdatesAutomatically: true,
    activityType: Location.ActivityType.Fitness,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Patika yürüyüş modu",
      notificationBody: "Konumun rota takibi ve güvenlik için kaydediliyor.",
      killServiceOnDestroy: false,
    },
  });
  return true;
}

export async function stopTracking(): Promise<void> {
  if (await Location.hasStartedLocationUpdatesAsync(TRACKING_TASK))
    await Location.stopLocationUpdatesAsync(TRACKING_TASK);
}
