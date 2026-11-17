import { create } from "zustand";
import { getToken, setToken } from "@/api/auth";
import { type AvatarSpec, DEFAULT_AVATAR } from "@/ui/Avatar";

interface SessionState {
  ready: boolean;
  token: string | null;
  nickname: string;
  avatar: AvatarSpec;
  /** Onboarding adımları tamamlandı mı (izinler + paket). */
  onboarded: boolean;
  visible: boolean;
  load(): Promise<void>;
  signIn(token: string): Promise<void>;
  signOut(): Promise<void>;
  setProfile(p: Partial<Pick<SessionState, "nickname" | "avatar" | "visible">>): void;
  setOnboarded(v: boolean): void;
}

/**
 * Oturum ve profil durumu. Jeton SecureStore'da; profil alanları şimdilik bellekte
 * (sunucu /me/profile ile senkron sonraki adımda).
 */
export const useSession = create<SessionState>((set) => ({
  ready: false,
  token: null,
  nickname: "",
  avatar: DEFAULT_AVATAR,
  onboarded: false,
  visible: false,
  load: async () => {
    const token = await getToken();
    set({ token, ready: true });
  },
  signIn: async (token) => {
    await setToken(token);
    set({ token });
  },
  signOut: async () => {
    await setToken(null);
    set({ token: null, onboarded: false });
  },
  setProfile: (p) => set(p),
  setOnboarded: (onboarded) => set({ onboarded }),
}));
