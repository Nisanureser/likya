import { OfflineManager, type OfflinePack } from "@maplibre/maplibre-react-native";

/**
 * Çevrimdışı harita paketi. MapLibre OfflineManager, verilen stil + bbox + zoom aralığı
 * için karoları indirir ve cihazda saklar. Paket boyutu/zoom seçimi teknik deneme fazında
 * ölçülecek (hedef: tüm rota koridoru z8–z14 ≤ 300 MB).
 */
export interface TrailPackOptions {
  /** Paket adı; metadata'da saklanır (ör. "likya-yolu@2027.03"). */
  name: string;
  styleURL: string;
  /** [minLon, minLat, maxLon, maxLat] */
  bounds: [number, number, number, number];
  minZoom?: number;
  maxZoom?: number;
  onProgress?: (pct: number) => void;
}

export async function findTrailPack(name: string): Promise<OfflinePack | undefined> {
  const packs = await OfflineManager.getPacks();
  return packs.find((p) => (p.metadata as { name?: string } | undefined)?.name === name);
}

export async function downloadTrailPack(opts: TrailPackOptions): Promise<OfflinePack> {
  const existing = await findTrailPack(opts.name);
  if (existing) return existing;
  return new Promise((resolve, reject) => {
    void OfflineManager.createPack(
      {
        mapStyle: opts.styleURL,
        bounds: opts.bounds,
        minZoom: opts.minZoom ?? 8,
        maxZoom: opts.maxZoom ?? 14,
        metadata: { name: opts.name },
      },
      (pack, status) => {
        opts.onProgress?.(status.percentage);
        if (status.percentage >= 100) resolve(pack);
      },
      (_pack, err) => reject(new Error(err.message)),
    ).catch(reject);
  });
}

export async function deleteTrailPack(name: string): Promise<void> {
  const pack = await findTrailPack(name);
  if (pack) await OfflineManager.deletePack(pack.id);
}
