import { describe, expect, test } from "bun:test";
import {
  bearingDeg,
  coarsen,
  cumulativeDistances,
  formatApproxDistance,
  haversineM,
  prepareStages,
  snapToTrail,
  trailDistanceM,
} from "../src";

// Ölüdeniz civarı, Likya Yolu başlangıcına yakın
const ovacik: [number, number] = [29.1369, 36.5589];
const faralya: [number, number] = [29.1266, 36.4953];

describe("haversine", () => {
  test("Ovacık–Faralya kuş uçuşu ~7.1 km", () => {
    const d = haversineM(ovacik, faralya);
    expect(d).toBeGreaterThan(7000);
    expect(d).toBeLessThan(7300);
  });
  test("aynı nokta 0", () => {
    expect(haversineM(ovacik, ovacik)).toBe(0);
  });
});

describe("bearing", () => {
  test("kuzeye 0, doğuya 90", () => {
    expect(Math.round(bearingDeg([29, 36], [29, 37]))).toBe(0);
    expect(Math.round(bearingDeg([29, 36], [30, 36]))).toBeCloseTo(90, -1);
  });
});

describe("track snap", () => {
  // Basit L şeklinde iki etaplı rota
  const stages = prepareStages([
    {
      seq: 1,
      line: [
        [29.0, 36.5],
        [29.01, 36.5],
        [29.02, 36.5],
      ],
      cumStartM: 0,
    },
  ]);
  const stage1Len = stages[0]!.lengthM;
  const stages2 = prepareStages([
    stages[0]!,
    {
      seq: 2,
      line: [
        [29.02, 36.5],
        [29.02, 36.51],
      ],
      cumStartM: stage1Len,
    },
  ]);

  test("çizgi üzerindeki nokta sıfır sapma ile snap olur", () => {
    const p = snapToTrail([29.005, 36.5], stages2)!;
    expect(p.stageSeq).toBe(1);
    expect(p.distanceToTrackM).toBeLessThan(0.5);
    expect(p.offsetOnTrailM).toBeGreaterThan(0);
  });

  test("ikinci etaptaki nokta kümülatif ofset taşır", () => {
    const p = snapToTrail([29.02, 36.505], stages2)!;
    expect(p.stageSeq).toBe(2);
    expect(p.offsetOnTrailM).toBeGreaterThan(stage1Len);
  });

  test("patika mesafesi kuş uçuşundan büyük", () => {
    const a = snapToTrail([29.0, 36.5], stages2)!;
    const b = snapToTrail([29.02, 36.51], stages2)!;
    const along = trailDistanceM(a, b);
    const straight = haversineM([29.0, 36.5], [29.02, 36.51]);
    expect(along).toBeGreaterThan(straight);
  });

  test("rotadan 500 m uzaktaki nokta sapma mesafesi verir", () => {
    const p = snapToTrail([29.01, 36.5045], stages2)!;
    expect(p.distanceToTrackM).toBeGreaterThan(450);
    expect(p.distanceToTrackM).toBeLessThan(550);
  });
});

describe("cumulative", () => {
  test("monoton artar", () => {
    const c = cumulativeDistances([
      [29, 36],
      [29.01, 36],
      [29.02, 36],
    ]);
    expect(c[0]).toBe(0);
    expect(c[1]!).toBeLessThan(c[2]!);
  });
});

describe("coarse", () => {
  test("aynı hücredeki iki nokta aynı sonucu verir", () => {
    const a = coarsen([29.13691, 36.55891], 250);
    const b = coarsen([29.13695, 36.55895], 250);
    expect(a).toEqual(b);
  });
  test("ham konumdan en fazla hücre köşegeni kadar uzak", () => {
    const raw: [number, number] = [29.1369, 36.5589];
    expect(haversineM(raw, coarsen(raw, 250))).toBeLessThan(250 * Math.SQRT2);
  });
  test("mesafe metni", () => {
    expect(formatApproxDistance(340)).toBe("~300 m");
    expect(formatApproxDistance(2600)).toBe("~2,5 km");
    expect(formatApproxDistance(2600, "en")).toBe("~2.5 km");
    expect(formatApproxDistance(12_400)).toBe("~12 km");
  });
});
