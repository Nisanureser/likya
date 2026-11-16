import type { LonLat } from "@patika/shared";
import { type SQL, sql } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";

/**
 * PostGIS geometry sütunları için özel tipler.
 * - Yazarken GeoJSON → ST_GeomFromGeoJSON (SRID 4326).
 * - Okurken PostGIS'in döndürdüğü hex EWKB'yi küçük bir çözücüyle parse ederiz.
 *   Karmaşık sorgularda `ST_AsGeoJSON` ile ham SQL kullanmak serbesttir.
 */

type GeoJsonPoint = { type: "Point"; coordinates: [number, number] };
type GeoJsonLine = { type: "LineString"; coordinates: [number, number][] };

function readEwkb(hex: string): GeoJsonPoint | GeoJsonLine {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  const view = new DataView(bytes.buffer);
  let off = 0;
  const little = bytes[off++] === 1;
  let type = view.getUint32(off, little);
  off += 4;
  const hasSrid = (type & 0x20000000) !== 0;
  const hasZ = (type & 0x80000000) !== 0;
  const hasM = (type & 0x40000000) !== 0;
  type = type & 0xff;
  if (hasSrid) off += 4;
  const dims = 2 + (hasZ ? 1 : 0) + (hasM ? 1 : 0);
  const readCoord = (): [number, number] => {
    const x = view.getFloat64(off, little);
    const y = view.getFloat64(off + 8, little);
    off += 8 * dims;
    return [x, y];
  };
  if (type === 1) return { type: "Point", coordinates: readCoord() };
  if (type === 2) {
    const n = view.getUint32(off, little);
    off += 4;
    const coords: [number, number][] = [];
    for (let i = 0; i < n; i++) coords.push(readCoord());
    return { type: "LineString", coordinates: coords };
  }
  throw new Error(`Desteklenmeyen EWKB tipi: ${type}`);
}

export const geoPoint = customType<{ data: LonLat; driverData: string; config: undefined }>({
  dataType() {
    return "geometry(Point,4326)";
  },
  toDriver(value: LonLat): SQL {
    const gj: GeoJsonPoint = { type: "Point", coordinates: [value[0], value[1]] };
    return sql`ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(gj)}), 4326)`;
  },
  fromDriver(value: string): LonLat {
    const g = readEwkb(value);
    if (g.type !== "Point") throw new Error("Point bekleniyordu");
    return g.coordinates;
  },
});

export const geoLine = customType<{ data: LonLat[]; driverData: string; config: undefined }>({
  dataType() {
    return "geometry(LineString,4326)";
  },
  toDriver(value: LonLat[]): SQL {
    const gj: GeoJsonLine = { type: "LineString", coordinates: value.map((c) => [c[0], c[1]]) };
    return sql`ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(gj)}), 4326)`;
  },
  fromDriver(value: string): LonLat[] {
    const g = readEwkb(value);
    if (g.type !== "LineString") throw new Error("LineString bekleniyordu");
    return g.coordinates;
  },
});

/** PostGIS yardımcıları (ham SQL parçaları). */
export const geo = {
  point: (lon: number, lat: number) => sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)`,
  /** Metre cinsinden yakınlık; geography'ye çevirerek. */
  dwithin: (col: SQL | unknown, lon: number, lat: number, meters: number) =>
    sql`ST_DWithin(${col}::geography, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography, ${meters})`,
  distanceM: (col: SQL | unknown, lon: number, lat: number) =>
    sql<number>`ST_Distance(${col}::geography, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography)`,
  asGeoJson: (col: SQL | unknown) => sql<string>`ST_AsGeoJSON(${col})`,
};
