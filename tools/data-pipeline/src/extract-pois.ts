/**
 * Rota koridorundaki OSM POI'lerini çeker (su, konaklama, dükkân, durak, antik yerler),
 * rota üzerine izdüşürür ve data/out/<slug>.pois.json yazar. Seed'e aktarmadan önce
 * elle gözden geçirin: OSM'de "drinking_water" her zaman gerçekten akan su değildir.
 */
import { type LonLat, prepareStages, snapToTrail } from "@patika/shared";
import { type OverpassNode, overpass } from "./overpass";

type Cfg = { slug: string; corridorKm: number; pois: { overpass: string[] } };
const cfgPath = process.argv[2] ?? new URL("../config/likya-yolu.json", import.meta.url).pathname;
const cfg: Cfg = JSON.parse(await Bun.file(cfgPath).text());
const outDir = new URL("../data/out/", import.meta.url).pathname;
const stagesFile = Bun.file(`${outDir}${cfg.slug}.stages.json`);
if (!(await stagesFile.exists())) {
  console.error("Önce `bun run stages` çalıştırın.");
  process.exit(1);
}
const data = JSON.parse(await stagesFile.text()) as {
  trail: { bbox: number[] };
  stages: Array<{ seq: number; cumStartM: number; line: [number, number][] }>;
};
const prepared = prepareStages(
  data.stages.map((s) => ({ seq: s.seq, line: s.line as LonLat[], cumStartM: s.cumStartM })),
);
const [minLon, minLat, maxLon, maxLat] = data.trail.bbox as [number, number, number, number];
const pad = 0.05;
const q = `[out:json][timeout:180];(${cfg.pois.overpass.map((s) => `${s}(${minLat - pad},${minLon - pad},${maxLat + pad},${maxLon + pad});`).join("")});out body;`;
const raw = await overpass(q);
const nodes = raw.elements.filter((e): e is OverpassNode => e.type === "node");

const typeOf = (t: Record<string, string>) => {
  if (
    t.amenity === "drinking_water" ||
    t.natural === "spring" ||
    t.man_made === "water_well" ||
    t.amenity === "fountain"
  )
    return "water";
  if (t.tourism === "camp_site") return "camp";
  if (t.tourism) return "lodging";
  if (t.shop || t.amenity === "restaurant" || t.amenity === "cafe") return "shop";
  if (t.highway === "bus_stop") return "transport";
  if (t.historic) return "landmark";
  return null;
};

const pois = [];
for (const n of nodes) {
  const tags = n.tags ?? {};
  const type = typeOf(tags);
  if (!type) continue;
  const pos = snapToTrail([n.lon, n.lat], prepared);
  if (!pos || pos.distanceToTrackM > cfg.corridorKm * 1000) continue;
  pois.push({
    source: "osm",
    sourceRef: `node/${n.id}`,
    type,
    name: { tr: tags["name:tr"] ?? tags.name ?? "", en: tags["name:en"] ?? tags.name ?? "" },
    geom: [n.lon, n.lat],
    stageSeq: pos.stageSeq,
    trailOffsetM: Math.round(pos.offsetOnTrailM),
    distanceFromTrackM: Math.round(pos.distanceToTrackM),
    isPaid: type === "lodging" || type === "shop" || type === "camp",
    tags,
  });
}
pois.sort((a, b) => a.trailOffsetM - b.trailOffsetM);
await Bun.write(`${outDir}${cfg.slug}.pois.json`, JSON.stringify(pois, null, 1));
console.log(`yazıldı: ${pois.length} POI → ${outDir}${cfg.slug}.pois.json`);
