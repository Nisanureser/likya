import type {
  LonLat,
  NeedKind,
  NeedStatus,
  PoiType,
  SyncPushRequest,
  SyncPushResponse,
} from "@patika/shared";
import { getToken } from "./auth";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * İnce HTTP istemcisi. Elysia Eden ile uçtan uca tip paylaşımı sonraki adımda
 * (apps/api `App` tipi dışa aktarıldı); şimdilik elle yazılmış tipler.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status} ${path}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T;
}

export interface PullPoi {
  id: string;
  type: PoiType;
  name: Record<string, string | undefined>;
  description: Record<string, string | undefined> | null;
  geom: LonLat;
  stageId: string | null;
  trailOffsetM: number | null;
  distanceFromTrackM: number | null;
  isPaid: boolean;
  seasonality: Record<string, string | undefined> | null;
  contact: Record<string, string> | null;
  derived: {
    status: string | null;
    lastReportAt: string | null;
    reportCount30d: number;
    confidence: number;
  };
  updatedAt: string;
  deletedAt: string | null;
}
export interface PullNeed {
  id: string;
  userId: string;
  kind: NeedKind;
  note: string | null;
  status: NeedStatus;
  paidOk: boolean;
  location: LonLat | null;
  stageId: string | null;
  expiresAt: string;
  updatedAt: string;
  version: number;
  nickname: string | null;
}
export interface PullResponse {
  dataVersion: string;
  pois: PullPoi[];
  needs: PullNeed[];
  hikes: Array<{ id: string; version: number; updatedAt: string } & Record<string, unknown>>;
  serverTime: string;
}

export const api = {
  requestCode: (email: string) =>
    request<{ ok: boolean }>("/auth/request-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  verify: (email: string, code: string) =>
    request<{ token: string; userId: string; isNew: boolean; hasProfile: boolean }>(
      "/auth/verify",
      { method: "POST", body: JSON.stringify({ email, code }) },
    ),
  me: () =>
    request<{ user: { id: string; email: string | null }; profile: unknown; contacts: unknown[] }>(
      "/me",
    ),
  trail: (slug: string) =>
    request<{
      id: string;
      slug: string;
      dataVersion: string;
      stages: Array<{
        id: string;
        seq: number;
        name: Record<string, string>;
        distanceM: number;
        cumStartM: number;
      }>;
    }>(`/trails/${slug}`),
  stagesGeoJson: (slug: string) =>
    request<GeoJSON.FeatureCollection>(`/trails/${slug}/stages.geojson`),
  pack: (slug: string) =>
    request<{
      dataVersion: string;
      tiles: { style: string; pmtiles: string };
      bbox: number[] | null;
    }>(`/trails/${slug}/pack`),
  syncPush: (body: SyncPushRequest) =>
    request<SyncPushResponse>("/sync/push", { method: "POST", body: JSON.stringify(body) }),
  syncPull: (q: { trail: string; since?: string; deviceId: string }) => {
    const p = new URLSearchParams({ trail: q.trail, deviceId: q.deviceId });
    if (q.since) p.set("since", q.since);
    return request<PullResponse>(`/sync/pull?${p}`);
  },
  presence: (trail: string, location: LonLat, stageId?: string) =>
    request<{ ok: boolean }>("/presence", {
      method: "PUT",
      body: JSON.stringify({ trail, location, stageId }),
    }),
  nearby: (lon: number, lat: number, radiusM?: number) =>
    request<{
      count: number;
      hikers: Array<{ userId: string; nickname: string; location: LonLat; distanceM: number }>;
    }>(`/presence/nearby?lon=${lon}&lat=${lat}${radiusM ? `&radiusM=${radiusM}` : ""}`),
};
