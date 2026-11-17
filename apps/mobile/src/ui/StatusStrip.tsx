import { StyleSheet, Text, View } from "react-native";
import { useSyncStore } from "@/store/sync";
import { colors, radius } from "./theme";

function ago(iso: string | null): string {
  if (!iso) return "henüz senkron yok";
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} sa önce` : `${Math.round(h / 24)} gün önce`;
}

/** Üstteki ince durum şeridi: çevrimiçi/çevrimdışı, son senkron, bekleyen işlem. */
export function StatusStrip({ pending = 0, extra }: { pending?: number; extra?: string }) {
  const online = useSyncStore((s) => s.online);
  const lastSync = useSyncStore((s) => s.lastSync);
  const parts = online ? ["Çevrimiçi"] : ["Çevrimdışı", `son senkron ${ago(lastSync)}`];
  if (pending > 0) parts.push(`${pending} bekleyen`);
  if (extra) parts.push(extra);
  return (
    <View style={styles.strip}>
      <View style={[styles.dot, { backgroundColor: online ? colors.primary : colors.textMuted }]} />
      <Text numberOfLines={1} style={[styles.text, online && { color: colors.primaryDark }]}>
        {parts.join(" · ")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 13, color: colors.textSecondary, flexShrink: 1 },
});
