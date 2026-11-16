/** WGS84 koordinat. GeoJSON sırası ile uyumlu: [lon, lat]. */
export type LonLat = readonly [lon: number, lat: number];

export interface I18nText {
  tr?: string;
  en?: string;
  [locale: string]: string | undefined;
}

/** Rota üzerinde bir nokta: hangi etapta, etap başından kaç metre, rota başından kaç metre. */
export interface TrackPosition {
  stageSeq: number;
  offsetInStageM: number;
  offsetOnTrailM: number;
  /** Rota çizgisine dik uzaklık (metre). Sapma uyarısı için. */
  distanceToTrackM: number;
  /** Snap edilen nokta. */
  snapped: LonLat;
}
