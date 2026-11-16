import { describe, expect, test } from "bun:test";
import { assertTransition, isTerminal } from "../src/services/needs-state";

describe("ihtiyaç durum makinesi", () => {
  test("geçerli akış: open → offered → accepted → completed", () => {
    expect(() => assertTransition("open", "offered")).not.toThrow();
    expect(() => assertTransition("offered", "accepted")).not.toThrow();
    expect(() => assertTransition("accepted", "completed")).not.toThrow();
  });
  test("tamamlanmış ihtiyaç tekrar açılamaz", () => {
    expect(() => assertTransition("completed", "open")).toThrow();
    expect(isTerminal("completed")).toBe(true);
    expect(isTerminal("expired")).toBe(true);
  });
  test("open doğrudan accepted olamaz (teklif gerekir)", () => {
    expect(() => assertTransition("open", "accepted")).toThrow();
  });
  test("teklif geri çevrilince open'a dönülebilir", () => {
    expect(() => assertTransition("offered", "open")).not.toThrow();
  });
});
