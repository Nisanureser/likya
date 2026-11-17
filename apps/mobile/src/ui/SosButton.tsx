import { useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "./theme";

/**
 * Her ekranın sağ üstündeki acil düğmesi.
 * Kısa basış → Acil ekranı; uzun basış → doğrudan 112 (tasarım kararı §5).
 */
export function SosButton() {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Acil durum"
      accessibilityHint="Uzun basınca 112'yi arar"
      onPress={() => router.push("/acil")}
      onLongPress={() => Linking.openURL("tel:112")}
      delayLongPress={600}
      style={({ pressed }) => [styles.btn, pressed && { transform: [{ scale: 0.94 }] }]}
    >
      <Text style={styles.label}>SOS</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: colors.onDanger, fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
});
