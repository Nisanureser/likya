import type { LonLat } from "../types";

const EARTH_RADIUS_M = 6_371_008.8;
const DEG = Math.PI / 180;

/** İki nokta arası büyük daire mesafesi (metre). Yürüyüş ölçeğinde yeterince hassas. */
export function haversineM(a: LonLat, b: LonLat): number {
  const dLat = (b[1] - a[1]) * DEG;
  const dLon = (b[0] - a[0]) * DEG;
  const lat1 = a[1] * DEG;
  const lat2 = b[1] * DEG;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** a noktasından b noktasına başlangıç yönü, derece (0 = kuzey, saat yönü). */
export function bearingDeg(a: LonLat, b: LonLat): number {
  const lat1 = a[1] * DEG;
  const lat2 = b[1] * DEG;
  const dLon = (b[0] - a[0]) * DEG;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) / DEG + 360) % 360;
}

/** Bir çizginin toplam uzunluğu ve her köşe için kümülatif mesafe (metre). */
export function cumulativeDistances(line: readonly LonLat[]): number[] {
  const out: number[] = new Array(line.length);
  let acc = 0;
  for (let i = 0; i < line.length; i++) {
    if (i > 0) acc += haversineM(line[i - 1] as LonLat, line[i] as LonLat);
    out[i] = acc;
  }
  return out;
}

export function lineLengthM(line: readonly LonLat[]): number {
  const c = cumulativeDistances(line);
  return c.length ? (c[c.length - 1] as number) : 0;
}
