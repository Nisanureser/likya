import { beforeAll, describe, expect, test } from "bun:test";
import { ulid } from "ulid";
import { makeTestApp } from "./helpers";

const t = makeTestApp();
const trail = "likya-yolu";
let alice = "";
let bob = "";
const suffix = Date.now();

beforeAll(async () => {
  alice = await t.login(`alice+${suffix}@test.local`);
  bob = await t.login(`bob+${suffix}@test.local`);
  for (const [tok, nick] of [
    [alice, `alice-${suffix}`],
    [bob, `bob-${suffix}`],
  ] as const) {
    const r = await t.json(
      "/me/profile",
      {
        nickname: nick,
        languages: ["tr"],
        visibility: { shareLocation: true, womenOnly: false, hideAtNight: false },
      },
      tok,
      "PUT",
    );
    expect(r.status).toBe(200);
  }
});

describe("health & trails", () => {
  test("health", async () => {
    const r = await t.api("/health");
    expect(r.status).toBe(200);
  });
  test("trail ve etaplar", async () => {
    const r = await t.api(`/trails/${trail}`);
    expect(r.status).toBe(200);
    const d = (await r.json()) as { stages: unknown[] };
    expect(d.stages.length).toBeGreaterThan(0);
  });
  test("sonraki su noktası patika mesafesiyle", async () => {
    const r = await t.api(`/trails/${trail}/next?offsetM=0&type=water`);
    expect(r.status).toBe(200);
    const d = (await r.json()) as Array<{ aheadM: number }>;
    expect(d.length).toBeGreaterThan(0);
    expect(d[0]!.aheadM).toBeGreaterThan(0);
  });
});

describe("ihtiyaç akışı", () => {
  const needId = ulid();
  const offerId = ulid();

  test("alice su ihtiyacı açar (kabalaştırılmış konum)", async () => {
    const r = await t.json(
      "/needs",
      {
        id: needId,
        trail,
        kind: "water",
        note: "1 litre yeter",
        location: [29.129, 36.5121],
        deviceCreatedAt: new Date().toISOString(),
      },
      alice,
    );
    expect(r.status).toBe(200);
    const list = (await (
      await t.api(`/needs?trail=${trail}`, { headers: { Authorization: `Bearer ${bob}` } })
    ).json()) as { needs: Array<{ id: string; location: [number, number] }> };
    const n = list.needs.find((x) => x.id === needId)!;
    expect(n).toBeDefined();
    // kabalaştırma: ham konumla birebir aynı olmamalı
    expect(n.location[0] === 29.129 && n.location[1] === 36.5121).toBe(false);
  });
  test("aynı id ile tekrar gönderim idempotent", async () => {
    const r = await t.json(
      "/needs",
      { id: needId, trail, kind: "water", deviceCreatedAt: new Date().toISOString() },
      alice,
    );
    expect(((await r.json()) as { applied: boolean }).applied).toBe(false);
  });
  test("sahibi kendi ihtiyacına teklif veremez", async () => {
    const r = await t.json(
      `/needs/${needId}/offers`,
      { id: ulid(), message: "x", deviceCreatedAt: new Date().toISOString() },
      alice,
    );
    expect(r.status).toBe(400);
  });
  test("bob teklif verir → offered", async () => {
    const r = await t.json(
      `/needs/${needId}/offers`,
      { id: offerId, message: "Su verebilirim", deviceCreatedAt: new Date().toISOString() },
      bob,
    );
    expect(r.status).toBe(200);
    const d = (await (
      await t.api(`/needs/${needId}`, { headers: { Authorization: `Bearer ${alice}` } })
    ).json()) as { status: string; offers: unknown[] };
    expect(d.status).toBe("offered");
    expect(d.offers.length).toBe(1);
  });
  test("alice kabul eder → accepted; bob tamamlayamaz, alice tamamlar", async () => {
    expect(
      (await t.json(`/needs/offers/${offerId}`, { decision: "accepted" }, alice, "PATCH")).status,
    ).toBe(200);
    expect(
      (await t.json(`/needs/${needId}/status`, { status: "completed" }, bob, "PATCH")).status,
    ).toBe(403);
    expect(
      (await t.json(`/needs/${needId}/status`, { status: "completed" }, alice, "PATCH")).status,
    ).toBe(200);
    const d = (await (
      await t.api(`/needs/${needId}`, { headers: { Authorization: `Bearer ${alice}` } })
    ).json()) as { status: string };
    expect(d.status).toBe("completed");
  });
  test("tamamlanmış ihtiyaç iptal edilemez (409)", async () => {
    expect(
      (await t.json(`/needs/${needId}/status`, { status: "cancelled" }, alice, "PATCH")).status,
    ).toBe(409);
  });
});

describe("senkron", () => {
  test("outbox push: rapor uygulanır, tekrar gönderim aynı sonucu verir, bozuk kayıt reddedilir", async () => {
    const poisRes = (await (await t.api(`/trails/${trail}/pois?type=water`)).json()) as {
      pois: Array<{ id: string }>;
    };
    const poiId = poisRes.pois[0]!.id;
    const reportId = ulid();
    const body = {
      deviceId: "test-device-0001",
      items: [
        {
          id: reportId,
          entity: "poi_report",
          op: "upsert",
          version: 1,
          deviceUpdatedAt: new Date().toISOString(),
          payload: {
            poiId,
            status: "flowing",
            observedAt: new Date().toISOString(),
            location: [29.129, 36.512],
          },
        },
        {
          id: ulid(),
          entity: "poi_report",
          op: "upsert",
          version: 1,
          deviceUpdatedAt: new Date().toISOString(),
          payload: {
            poiId: "00000000000000000000000000",
            status: "dry",
            observedAt: new Date().toISOString(),
          },
        },
      ],
    };
    const r1 = (await (await t.json("/sync/push", body, alice)).json()) as {
      results: Array<{ status: string }>;
    };
    expect(r1.results[0]!.status).toBe("applied");
    expect(r1.results[1]!.status).toBe("rejected");
    const r2 = (await (await t.json("/sync/push", body, alice)).json()) as {
      results: Array<{ status: string }>;
    };
    expect(r2.results[0]!.status).toBe("applied");
    const poi = (await (await t.api(`/trails/${trail}/pois?type=water`)).json()) as {
      pois: Array<{ id: string; derived: { status: string } }>;
    };
    expect(poi.pois.find((p) => p.id === poiId)!.derived.status).toBe("flowing");
  });
  test("pull delta", async () => {
    const r = (await (
      await t.api(`/sync/pull?trail=${trail}&deviceId=test-device-0001`, {
        headers: { Authorization: `Bearer ${alice}` },
      })
    ).json()) as { pois: unknown[]; serverTime: string };
    expect(r.pois.length).toBeGreaterThan(0);
    const r2 = (await (
      await t.api(`/sync/pull?trail=${trail}&since=${encodeURIComponent(r.serverTime)}`, {
        headers: { Authorization: `Bearer ${alice}` },
      })
    ).json()) as { pois: unknown[] };
    expect(r2.pois.length).toBe(0);
  });
});

describe("varlık ve yürüyüş güvenliği", () => {
  test("presence: bob alice'i yakınında görür, kendini görmez", async () => {
    expect(
      (await t.json("/presence", { trail, location: [29.13, 36.52] }, alice, "PUT")).status,
    ).toBe(200);
    expect(
      (await t.json("/presence", { trail, location: [29.131, 36.521] }, bob, "PUT")).status,
    ).toBe(200);
    const d = (await (
      await t.api("/presence/nearby?lon=29.13&lat=36.52", {
        headers: { Authorization: `Bearer ${bob}` },
      })
    ).json()) as { count: number; hikers: Array<{ nickname: string }> };
    expect(d.hikers.some((h) => h.nickname === `alice-${suffix}`)).toBe(true);
    expect(d.hikers.some((h) => h.nickname === `bob-${suffix}`)).toBe(false);
  });
  test("hike LWW: eski sürüm yok sayılır", async () => {
    const id = ulid();
    const base = {
      trail,
      startStageSeq: 1,
      endStageSeq: 2,
      plannedStart: new Date().toISOString(),
      plannedEta: new Date(Date.now() + 3600_000).toISOString(),
      status: "active",
      trustedContactIds: [],
    };
    expect(
      (
        (await (await t.json(`/hikes/${id}`, { ...base, version: 2 }, alice, "PUT")).json()) as {
          applied: boolean;
        }
      ).applied,
    ).toBe(true);
    expect(
      (
        (await (await t.json(`/hikes/${id}`, { ...base, version: 1 }, alice, "PUT")).json()) as {
          applied: boolean;
        }
      ).applied,
    ).toBe(false);
    expect((await t.json(`/hikes/${id}/arrive`, {}, alice)).status).toBe(200);
  });
});
