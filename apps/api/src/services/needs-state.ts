import { NEED_TRANSITIONS, type NeedStatus } from "@patika/shared";

export class InvalidTransition extends Error {
  constructor(from: NeedStatus, to: NeedStatus) {
    super(`Geçersiz durum geçişi: ${from} → ${to}`);
  }
}

export function assertTransition(from: NeedStatus, to: NeedStatus): void {
  if (!NEED_TRANSITIONS[from].includes(to)) throw new InvalidTransition(from, to);
}

export function isTerminal(status: NeedStatus): boolean {
  return NEED_TRANSITIONS[status].length === 0;
}

/**
 * Kim hangi geçişi yapabilir?
 * - Sahip: cancelled, completed, accepted (teklif kabul), open (teklifi geri çevir)
 * - Yardımcı: offered (teklif ver) — teklif üzerinden
 * - Sistem: expired
 */
export function allowedForOwner(to: NeedStatus): boolean {
  return to === "cancelled" || to === "completed" || to === "accepted" || to === "open";
}
