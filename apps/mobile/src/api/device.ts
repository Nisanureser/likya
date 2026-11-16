import * as SecureStore from "expo-secure-store";
import { ulid } from "ulid";

const KEY = "patika.deviceId";
let cached: string | null = null;

/** Cihaz kimliği: senkron imleci ve push kaydı için; kişisel veri içermez. */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  let id = await SecureStore.getItemAsync(KEY);
  if (!id) {
    id = ulid();
    await SecureStore.setItemAsync(KEY, id);
  }
  cached = id;
  return id;
}
