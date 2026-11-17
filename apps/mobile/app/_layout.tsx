import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { openDatabase } from "@/db/client";
import { useSession } from "@/store/session";
import { startSyncLoop } from "@/sync/engine";
import { colors } from "@/ui/theme";
import "@/location/tracking";

const queryClient = new QueryClient();

/**
 * Kök düzen: altyapıyı başlatır (SQLite, senkron) ve oturuma göre yönlendirir.
 *  - jeton yok → /giris (hoş geldin)
 *  - jeton var, onboarding bitmedi → /giris/izinler
 *  - aksi hâlde → (tabs)
 */
export default function RootLayout() {
  const { ready, token, onboarded, load } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    openDatabase();
    void load();
    return startSyncLoop();
  }, [load]);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === "giris";
    if (!token && !inAuth) router.replace("/giris");
    else if (token && !onboarded && !inAuth) router.replace("/giris/izinler");
    else if (token && onboarded && inAuth) router.replace("/(tabs)/harita");
  }, [ready, token, onboarded, segments, router]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="giris" />
          <Stack.Screen name="acil" options={{ presentation: "fullScreenModal" }} />
          <Stack.Screen
            name="ihtiyac/index"
            options={{ presentation: "formSheet", sheetAllowedDetents: [0.92] }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
