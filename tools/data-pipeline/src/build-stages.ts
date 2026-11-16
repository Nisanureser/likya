/**
 * OSM'den Likya Yolu rota ilişkisini çeker, yolları (way) uç uca birleştirerek tek bir
 * çizgi dizisi oluşturur, kümülatif mesafeleri hesaplar ve config'teki etap sınırlarına
 * göre böler. Çıktı: data/out/<slug>.stages.json (seed bunu okur) ve <slug>.stages.geojson.
 *
 * Sınırlar:
 * - OSM ilişkisi kopuk/dallı olabilir (alternatif rotalar). Bu betik "ana" rotayı en uzun
 *   bağlı zincir olarak seçer; yan dalları `branches` olarak ayrıca yazar. Elle gözden geçirin.
 * - Yükseklik (ascent/descent) burada hesaplanmaz; SRTM/terrain-RGB ile ayrı adım.
 */
import { cumulativeDistances, haversineM, type LonLat } from "@patika/shared";
import { type OverpassWay, overpass } from "./overpass";

type Cfg = {
  slug: string;
  name: { tr: string; en: string };
  osm: { relationQuery: string; bbox: number[] };
  stageBreaks: { cumulativeKm: number[] };
};

const cfgPath = process.argv[2] ?? new URL("../config/likya-yolu.json", import.meta.url).pathname;
const cfg: Cfg = JSON.parse(await Bun.file(cfgPath).text());
const outDir = new URL("../data/out/", import.meta.url).pathname;
const rawPath = `${new URL("../data/raw/", import.meta.url).pathname}${cfg.slug}.relation.json`;

let raw: Awaited<ReturnType<typeof overpass>>;
if ((await Bun.file(rawPath).exists()) && !process.argv.includes("--refresh")) {
  console.log("ham veri önbellekten:", rawPath);
  raw = JSON.parse(await Bun.file(rawPath).text());
} else {
  const [minLon, minLat, maxLon, maxLat] = cfg.osm.bbox as [number, number, number, number];
  const q = `[out:json][timeout:180];
${cfg.osm.relationQuery}(${minLat},${minLon},${maxLat},${maxLon});
out tags;
>>;
out geom;`;
  console.log("Overpass sorgusu gönderiliyor…");
  raw = await overpass(q);
  await Bun.write(rawPath, JSON.stringify(raw));
  console.log("ham veri kaydedildi:", rawPath, raw.elements.length, "eleman");
}

const ways = raw.elements.filter(
  (e): e is OverpassWay => e.type === "way" && Array.isArray(e.geometry),
);
console.log("yol sayısı:", ways.length);
if (ways.length === 0) {
  console.error("Hiç yol bulunamadı. relationQuery veya bbox'ı kontrol edin.");
  process.exit(1);
}

// Uç uca birleştirme: her yolun uçlarını anahtarla; en uzun zinciri kur.
const key = (p: { lat: number; lon: number }) => `${p.lat.toFixed(6)},${p.lon.toFixed(6)}`;
type Seg = { id: number; pts: LonLat[]; a: string; b: string; len: number };
const segs: Seg[] = ways.map((w) => {
  const pts = (w.geometry ?? []).map((g) => [g.lon, g.lat] as LonLat);
  const c = cumulativeDistances(pts);
  return {
    id: w.id,
    pts,
    a: key(w.geometry![0]!),
    b: key(w.geometry![w.geometry!.length - 1]!),
    len: c[c.length - 1] ?? 0,
  };
});
const byEnd = new Map<string, Seg[]>();
for (const s of segs) for (const k of [s.a, s.b]) byEnd.set(k, [...(byEnd.get(k) ?? []), s]);

const used = new Set<number>();
function walk(start: Seg, fromKey: string): LonLat[] {
  const line: LonLat[] = [];
  let cur: Seg | undefined = start;
  let at = fromKey;
  while (cur && !used.has(cur.id)) {
    used.add(cur.id);
    const forward = cur.a === at;
    const pts = forward ? cur.pts : [...cur.pts].reverse();
    line.push(...(line.length ? pts.slice(1) : pts));
    at = forward ? cur.b : cur.a;
    const next = (byEnd.get(at) ?? []).filter((s) => !used.has(s.id));
    cur = next.sort((x, y) => y.len - x.len)[0];
  }
  return line;
}

// Derece-1 uçlardan (zincir başı) başla; en uzun zinciri ana rota kabul et.
const chains: LonLat[][] = [];
const endpoints = [...byEnd.entries()].filter(([, v]) => v.length === 1).map(([k]) => k);
for (const k of endpoints) {
  const s = byEnd.get(k)?.find((x) => !used.has(x.id));
  if (s) chains.push(walk(s, k));
}
for (const s of segs) if (!used.has(s.id)) chains.push(walk(s, s.a)); // döngüler
chains.sort((x, y) => (cumulativeDistances(y).at(-1) ?? 0) - (cumulativeDistances(x).at(-1) ?? 0));
const main = chains[0] ?? [];
const branches = chains.slice(1);
const cum = cumulativeDistances(main);
const totalM = cum.at(-1) ?? 0;
console.log(
  `ana rota: ${main.length} nokta, ${(totalM / 1000).toFixed(1)} km; yan dal: ${branches.length}`,
);

// Etaplara böl
const breaksM = cfg.stageBreaks.cumulativeKm
  .map((k) => k * 1000)
  .filter((m) => m > 0 && m < totalM)
  .sort((a, b) => a - b);
const bounds = [0, ...breaksM, totalM];
const stages = [];
for (let i = 0; i < bounds.length - 1; i++) {
  const from = bounds[i]!;
  const to = bounds[i + 1]!;
  const line: LonLat[] = [];
  for (let j = 0; j < main.length; j++) {
    const d = cum[j]!;
    if (d >= from && d <= to) line.push(main[j]!);
  }
  if (line.length < 2) continue;
  stages.push({
    seq: i + 1,
    name: { tr: `Etap ${i + 1}`, en: `Stage ${i + 1}` },
    distanceM: Math.round(to - from),
    cumStartM: Math.round(from),
    line: line.map(([lon, lat]) => [Number(lon.toFixed(6)), Number(lat.toFixed(6))]),
  });
}

const lons = main.map((p) => p[0]);
const lats = main.map((p) => p[1]);
const bbox = [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)].map((v) =>
  Number(v.toFixed(4)),
);

const out = {
  trail: { slug: cfg.slug, name: cfg.name, lengthM: Math.round(totalM), bbox },
  stages,
  branches: branches.map((b) => ({
    points: b.length,
    lengthM: Math.round(cumulativeDistances(b).at(-1) ?? 0),
  })),
};
await Bun.write(`${outDir}${cfg.slug}.stages.json`, JSON.stringify(out));
await Bun.write(
  `${outDir}${cfg.slug}.stages.geojson`,
  JSON.stringify({
    type: "FeatureCollection",
    features: stages.map((s) => ({
      type: "Feature",
      properties: { seq: s.seq, name: s.name, distanceM: s.distanceM, cumStartM: s.cumStartM },
      geometry: { type: "LineString", coordinates: s.line },
    })),
  }),
);
console.log(
  `yazıldı: ${outDir}${cfg.slug}.stages.json (${stages.length} etap), ilk/son nokta mesafesi ${(haversineM(main[0]!, main.at(-1)!) / 1000).toFixed(1)} km`,
);
