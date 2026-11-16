import * as SecureStore from "expo-secure-store";

const KEY = "patika.token";
let cached: string | null | undefined;

export async function getToken(): Promise<string | null> {
  if (cached !== undefined) return cached;
  cached = await SecureStore.getItemAsync(KEY);
  return cached;
}
export async function setToken(token: string | null): Promise<void> {
  cached = token;
  if (token) await SecureStore.setItemAsync(KEY, token);
  else await SecureStore.deleteItemAsync(KEY);
}
