import type { LonLat, TrackPosition } from "../types";
import { cumulativeDistances, haversineM } from "./distance";

/**
 * Yerel düzlem yaklaşımı: küçük alanlarda (bir etap) enlem/boylamı metreye çevirip
 * düz geometriyle izdüşüm alırız. Hata, 50 km'lik bir etapta santimetre düzeyindedir.
 */
function toLocalXY(p: LonLat, refLat: number): [number, number] {
  const kx = 111_320 * Math.cos(refLat * (Math.PI / 180));
  const ky = 110_574;
  return [p[0] * kx, p[1] * ky];
}

function fromLocalXY(x: number, y: number, refLat: number): LonLat {
  const kx = 111_320 * Math.cos(refLat * (Math.PI / 180));
  const ky = 110_574;
  return [x / kx, y / ky];
}

export interface StageTrack {
  seq: number;
  /** Etap çizgisi, [lon, lat] dizisi. */
  line: readonly LonLat[];
  /** Rota başından bu etabın başına kadar metre. */
  cumStartM: number;
}

export interface PreparedStage extends StageTrack {
  cum: number[];
  lengthM: number;
}

/** Etap çizgilerini bir kez hazırlayın; snap işlemleri bu yapı üzerinde çalışır. */
export function prepareStages(stages: readonly StageTrack[]): PreparedStage[] {
  return stages.map((s) => {
    const cum = cumulativeDistances(s.line);
    return { ...s, cum, lengthM: cum.length ? (cum[cum.length - 1] as number) : 0 };
  });
}

/**
 * Bir noktayı etap çizgisine izdüşür. Çizgi boyunca ofset ve dik uzaklığı döner.
 * Uzun çizgilerde tüm segmentler taranır; bir etap için (binlerce köşe) telefonda
 * milisaniyeler sürer. Gerekirse kaba bir bbox ön filtresi eklenebilir.
 */
export function snapToStage(point: LonLat, stage: PreparedStage): TrackPosition | null {
  const n = stage.line.length;
  if (n === 0) return null;
  if (n === 1) {
    const only = stage.line[0] as LonLat;
    return {
      stageSeq: stage.seq,
      offsetInStageM: 0,
      offsetOnTrailM: stage.cumStartM,
      distanceToTrackM: haversineM(point, only),
      snapped: only,
    };
  }
  const refLat = point[1];
  const [px, py] = toLocalXY(point, refLat);
  let best: { d2: number; i: number; t: number; x: number; y: number } | null = null;

  for (let i = 0; i < n - 1; i++) {
    const [ax, ay] = toLocalXY(stage.line[i] as LonLat, refLat);
    const [bx, by] = toLocalXY(stage.line[i + 1] as LonLat, refLat);
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const x = ax + t * dx;
    const y = ay + t * dy;
    const d2 = (px - x) ** 2 + (py - y) ** 2;
    if (!best || d2 < best.d2) best = { d2, i, t, x, y };
  }
  if (!best) return null;
  const segStart = stage.cum[best.i] as number;
  const segLen = (stage.cum[best.i + 1] as number) - segStart;
  const offsetInStageM = segStart + best.t * segLen;
  return {
    stageSeq: stage.seq,
    offsetInStageM,
    offsetOnTrailM: stage.cumStartM + offsetInStageM,
    distanceToTrackM: Math.sqrt(best.d2),
    snapped: fromLocalXY(best.x, best.y, refLat),
  };
}

/** Tüm etaplar arasında en yakın izdüşümü bulur. */
export function snapToTrail(point: LonLat, stages: readonly PreparedStage[]): TrackPosition | null {
  let best: TrackPosition | null = null;
  for (const s of stages) {
    const p = snapToStage(point, s);
    if (p && (!best || p.distanceToTrackM < best.distanceToTrackM)) best = p;
  }
  return best;
}

/**
 * İki rota konumu arasındaki patika mesafesi (metre). Pozitif = ileri yönde.
 * "Kuş uçuşu değil, patika boyunca" bilgisi buradan gelir.
 */
export function trailDistanceM(from: TrackPosition, to: TrackPosition): number {
  return to.offsetOnTrailM - from.offsetOnTrailM;
}

/** Rotadan sapmış mı? */
export function isOffTrack(pos: TrackPosition | null, thresholdM: number): boolean {
  return !pos || pos.distanceToTrackM > thresholdM;
}
