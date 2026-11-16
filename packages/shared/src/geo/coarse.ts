import type { LonLat } from "../types";

/**
 * Konumu bir ızgara hücresinin merkezine yuvarlar. Başkalarına gösterilen konum
 * her zaman bu fonksiyondan geçer; ham konum asla paylaşılmaz.
 * Boylam hücre genişliği, ham enlem yerine yuvarlanmış enleme göre hesaplanır;
 * böylece aynı hücredeki tüm noktalar aynı sonucu verir (deterministik).
 */
export function coarsen(point: LonLat, cellM: number): LonLat {
  const latDeg = cellM / 110_574;
  const lat = (Math.floor(point[1] / latDeg) + 0.5) * latDeg;
  const lonDeg = cellM / (111_320 * Math.cos(lat * (Math.PI / 180)));
  const lon = (Math.floor(point[0] / lonDeg) + 0.5) * lonDeg;
  return [Number(lon.toFixed(6)), Number(lat.toFixed(6))];
}

/** Kullanıcıya gösterilecek kaba mesafe metni: "~300 m", "~2 km". */
export function formatApproxDistance(m: number, locale: "tr" | "en" = "tr"): string {
  const prefix = "~";
  if (m < 1000) {
    const r = Math.max(100, Math.round(m / 100) * 100);
    return `${prefix}${r} m`;
  }
  const km = m < 10_000 ? (Math.round(m / 500) * 500) / 1000 : Math.round(m / 1000);
  const s = locale === "tr" ? String(km).replace(".", ",") : String(km);
  return `${prefix}${s} km`;
}
