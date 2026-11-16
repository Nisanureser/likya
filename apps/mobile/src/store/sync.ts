import { create } from "zustand";

interface SyncState {
  online: boolean;
  syncing: boolean;
  lastSync: string | null;
  error: string | null;
  setOnline(v: boolean): void;
  setSyncing(v: boolean): void;
  setLastSync(v: string): void;
  setError(v: string | null): void;
}

export const useSyncStore = create<SyncState>((set) => ({
  online: false,
  syncing: false,
  lastSync: null,
  error: null,
  setOnline: (online) => set({ online }),
  setSyncing: (syncing) => set({ syncing, ...(syncing ? { error: null } : {}) }),
  setLastSync: (lastSync) => set({ lastSync }),
  setError: (error) => set({ error }),
}));
