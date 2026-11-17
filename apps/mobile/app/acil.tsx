import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { ChevronIcon, PhoneIcon } from "@/ui/icons";
import { colors, font, radius, space } from "@/ui/theme";

/** Acil ekranı. İlk adım 112; uygulama arama-kurtarmanın yerine geçmez. */
export default function AcilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const coord = "36.4471° K, 29.1868° D";
  const smsBody = encodeURIComponent(
    `Patika acil: ${coord} — Etap 12, Alınca'dan 3,2 km. Lütfen ara.`,
  );

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.lg },
      ]}
    >
      <View style={styles.header}>
        <Text style={[font.h1, { color: colors.dangerDark }]}>Acil durum</Text>
        <Pressable accessibilityLabel="Kapat" onPress={() => router.back()} style={styles.close}>
          <Text style={{ fontSize: 22, color: colors.text }}>×</Text>
        </Pressable>
      </View>
      <Text style={font.bodySecondary}>
        Bu ekran arama-kurtarmanın yerine geçmez. Hayati tehlike varsa önce 112'yi ara. Sesli arama,
        veriden daha geniş alanda çalışır.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => Linking.openURL("tel:112")}
        style={({ pressed }) => [styles.call, pressed && { transform: [{ scale: 0.98 }] }]}
      >
        <View style={styles.callIcon}>
          <PhoneIcon />
        </View>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: colors.onDanger }}>
            112'yi ara
          </Text>
          <Text style={{ fontSize: 13, color: "#F7C1C1" }}>
            Jandarma, AFAD ve sağlık tek numarada
          </Text>
        </View>
      </Pressable>
      <Card style={{ gap: 8 }}>
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Text style={font.label}>Konumun</Text>
          <Text style={font.caption}>GPS · 1 dk önce · ±8 m</Text>
        </View>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "600",
            color: colors.text,
            fontVariant: ["tabular-nums"],
          }}
        >
          {coord}
        </Text>
        <Text style={font.bodySecondary}>
          Etap 12 · Alınca'dan 3,2 km, Gey'e 8,2 km · 710 m yükseklik
        </Text>
        <Button
          label={copied ? "Kopyalandı ✓" : "Koordinatı kopyala"}
          variant="secondary"
          size="md"
          onPress={async () => {
            await Clipboard.setStringAsync(coord);
            setCopied(true);
          }}
        />
      </Card>
      <Pressable onPress={() => Linking.openURL(`sms:&body=${smsBody}`)}>
        <Card style={[styles.row, { padding: 14 }]}>
          <View style={styles.ico}>
            <Text style={{ fontSize: 20 }}>💬</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={font.title}>Güvenilir kişiye SMS taslağı</Text>
            <Text style={font.caption}>Koordinat ve etap hazır yazılı, sen gönderirsin</Text>
          </View>
          <ChevronIcon />
        </Card>
      </Pressable>
      <Pressable onPress={() => setShared(true)}>
        <Card style={[styles.row, { padding: 14 }]}>
          <View style={styles.ico}>
            <Text style={{ fontSize: 20 }}>📍</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={font.title}>
              {shared ? "Son konum gönderildi ✓" : "Son konumumu güvenilir kişime gönder"}
            </Text>
            <Text style={font.caption}>
              {shared ? "Sinyal gelir gelmez görecek" : "Sunucuya yalnız bu konum gider, iz gitmez"}
            </Text>
          </View>
        </Card>
      </Pressable>
      <Text style={[font.caption, { textAlign: "center", marginTop: "auto" }]}>
        SOS düğmesine uzun basış doğrudan 112'yi arar.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, gap: space.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  call: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.danger,
  },
  callIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  ico: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
