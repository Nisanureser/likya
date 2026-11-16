/** Overpass API istemcisi. Nazik kullanım: tek istek, uzun zaman aşımı, kullanıcı ajanı. */
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export async function overpass(query: string): Promise<OverpassResponse> {
  let lastErr: unknown;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "patika-data-pipeline/0.1",
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) throw new Error(`${url} → ${res.status}`);
      return (await res.json()) as OverpassResponse;
    } catch (e) {
      lastErr = e;
      console.warn("overpass hata, sonraki uç deneniyor:", e);
    }
  }
  throw lastErr;
}

export interface OverpassNode {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}
export interface OverpassWay {
  type: "way";
  id: number;
  nodes: number[];
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
}
export interface OverpassRelation {
  type: "relation";
  id: number;
  members: Array<{ type: string; ref: number; role: string }>;
  tags?: Record<string, string>;
}
export interface OverpassResponse {
  elements: Array<OverpassNode | OverpassWay | OverpassRelation>;
}
