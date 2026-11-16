import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { openDatabase } from "@/db/client";
import { startSyncLoop } from "@/sync/engine";
import "@/location/tracking";

const queryClient = new QueryClient();

/**
 * Kök düzen. Ekran yapısı ve görsel tasarım henüz kararlaştırılmadı;
 * burada yalnız altyapı başlatılır (SQLite, senkron döngüsü).
 */
export default function RootLayout() {
  useEffect(() => {
    openDatabase();
    const stop = startSyncLoop();
    return stop;
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
