/**
 * Geliştirme tohumu. Etaplar için önce veri hattının ürettiği dosyaya bakar
 * (tools/data-pipeline/data/out/likya-yolu.stages.json); yoksa iki örnek etap üretir.
 * Gerçek POI verisi keşif fazında toplanacak; buradakiler yalnız geliştirme içindir.
 */
import { existsSync } from "node:fs";
import { DEFAULT_TRAIL_SLUG, type LonLat, prepareStages, snapToTrail } from "@patika/shared";
import { eq, sql } from "drizzle-orm";
import { ulid } from "ulid";
import { createDb } from "./index";
import { pois, stages, trails } from "./schema";

type StageFile = {
  trail: { slug: string; name: { tr: string; en: string }; lengthM: number; bbox: number[] };
  stages: Array<{
    seq: number;
    name: { tr: string; en: string };
    distanceM: number;
    cumStartM: number;
    ascentM?: number;
    descentM?: number;
    line: [number, number][];
  }>;
};

const url = process.env.DATABASE_URL ?? "postgres://patika:patika@localhost:5432/patika";
const db = createDb(url, { max: 2 });

const stagesPath = new URL(
  "../../../tools/data-pipeline/data/out/likya-yolu.stages.json",
  import.meta.url,
).pathname;

let data: StageFile;
if (existsSync(stagesPath)) {
  data = JSON.parse(await Bun.file(stagesPath).text());
  console.log(`veri hattı çıktısı kullanılıyor: ${data.stages.length} etap`);
} else {
  console.log(
    "veri hattı çıktısı yok; örnek etaplar kullanılıyor (bun run data:stages ile üretin)",
  );
  const s1: [number, number][] = [
    [29.1369, 36.5589], // Ovacık
    [29.1345, 36.542],
    [29.13, 36.52],
    [29.1266, 36.4953], // Faralya
  ];
  const s2: [number, number][] = [
    [29.1266, 36.4953], // Faralya
    [29.118, 36.48],
    [29.112, 36.47],
    [29.107, 36.461], // Kabak
  ];
  data = {
    trail: {
      slug: DEFAULT_TRAIL_SLUG,
      name: { tr: "Likya Yolu", en: "Lycian Way" },
      lengthM: 0,
      bbox: [],
    },
    stages: [
      {
        seq: 1,
        name: { tr: "Ovacık – Faralya", en: "Ovacık – Faralya" },
        distanceM: 0,
        cumStartM: 0,
        line: s1,
      },
      {
        seq: 2,
        name: { tr: "Faralya – Kabak", en: "Faralya – Kabak" },
        distanceM: 0,
        cumStartM: 0,
        line: s2,
      },
    ],
  };
}

// Kümülatif mesafeleri tutarlı hale getir
const prepared = prepareStages(
  data.stages.map((s) => ({ seq: s.seq, line: s.line as LonLat[], cumStartM: 0 })),
);
let acc = 0;
for (const p of prepared) {
  p.cumStartM = acc;
  acc += p.lengthM;
}

await db.transaction(async (tx) => {
  await tx.delete(trails).where(eq(trails.slug, data.trail.slug));
  const [trail] = await tx
    .insert(trails)
    .values({
      id: ulid(),
      slug: data.trail.slug,
      name: data.trail.name,
      dataVersion: new Date().toISOString().slice(0, 10).replaceAll("-", "."),
      bbox: data.trail.bbox.length ? data.trail.bbox : null,
      lengthM: Math.round(acc),
    })
    .returning();
  if (!trail) throw new Error("trail insert failed");

  const stageIds = new Map<number, string>();
  for (const p of prepared) {
    const src = data.stages.find((s) => s.seq === p.seq);
    if (!src) continue;
    const id = ulid();
    stageIds.set(p.seq, id);
    await tx.insert(stages).values({
      id,
      trailId: trail.id,
      seq: p.seq,
      name: src.name,
      distanceM: Math.round(p.lengthM),
      ascentM: src.ascentM ?? null,
      descentM: src.descentM ?? null,
      cumStartM: Math.round(p.cumStartM),
      track: p.line as LonLat[],
    });
  }

  // Örnek POI'ler (yalnız geliştirme; koordinatlar yaklaşık)
  const samplePois: Array<{
    type: typeof pois.$inferInsert.type;
    name: { tr: string; en: string };
    geom: LonLat;
    isPaid?: boolean;
  }> = [
    { type: "water", name: { tr: "Kirme çeşmesi", en: "Kirme fountain" }, geom: [29.129, 36.512] },
    {
      type: "lodging",
      name: { tr: "Faralya pansiyonları", en: "Faralya guesthouses" },
      geom: [29.1266, 36.4953],
      isPaid: true,
    },
    {
      type: "camp",
      name: { tr: "Kabak kamp alanı", en: "Kabak camp" },
      geom: [29.107, 36.461],
      isPaid: true,
    },
    {
      type: "shop",
      name: { tr: "Ovacık market", en: "Ovacık market" },
      geom: [29.1369, 36.5589],
      isPaid: true,
    },
  ];
  for (const p of samplePois) {
    const pos = snapToTrail(p.geom, prepared);
    await tx.insert(pois).values({
      id: ulid(),
      trailId: trail.id,
      type: p.type,
      name: p.name,
      geom: p.geom,
      stageId: pos ? (stageIds.get(pos.stageSeq) ?? null) : null,
      trackOffsetM: pos ? Math.round(pos.offsetInStageM) : null,
      trailOffsetM: pos ? Math.round(pos.offsetOnTrailM) : null,
      distanceFromTrackM: pos ? Math.round(pos.distanceToTrackM) : null,
      isPaid: p.isPaid ?? false,
      source: "seed",
    });
  }
});

const count = await db.execute(
  sql`select (select count(*) from stages) as stages, (select count(*) from pois) as pois`,
);
console.log("seed tamam:", count[0]);
process.exit(0);
