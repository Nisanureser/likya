import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useSession } from "@/store/session";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Screen } from "@/ui/Screen";
import { colors, font, radius } from "@/ui/theme";

type Phase = "idle" | "busy" | "done";

/** Harita paketi indirme. Gerçek indirme MapLibre OfflineManager ile PMTiles hazır olunca (src/map/offline.ts). */
export default function PaketScreen() {
  const router = useRouter();
  const setOnboarded = useSession((s) => s.setOnboarded);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);
  const [wifiOnly, setWifiOnly] = useState(true);

  useEffect(() => {
    if (phase !== "busy") return;
    const t = setInterval(() => {
      setPct((p) => {
        const n = Math.min(100, p + 9);
        if (n >= 100) {
          clearInterval(t);
          setPhase("done");
        }
        return n;
      });
    }, 180);
    return () => clearInterval(t);
  }, [phase]);

  const finish = () => {
    setOnboarded(true);
    router.replace("/(tabs)/harita");
  };

  return (
    <Screen sos={false} style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text style={font.label}>Adım 3 / 3</Text>
        <Text style={[font.h1, { fontSize: 28 }]}>Likya Yolu'nu indir</Text>
        <Text style={font.bodySecondary}>
          Harita, 29 etap ve tüm noktalar telefonunda kalır. Rotada sinyal olmasa da çalışır.
        </Text>
      </View>
      <Card padded={false} style={{ overflow: "hidden" }}>
        <View style={styles.hero}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primaryDark }}>
            Fethiye → Antalya · 540 km
          </Text>
        </View>
        <View style={{ padding: 16, gap: 12 }}>
          <Row l="Harita karoları (z8–14)" r="310 MB" />
          <Row l="Etaplar, noktalar, yükseklik" r="6 MB" />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          {phase === "idle" && <Button label="İndir · 316 MB" onPress={() => setPhase("busy")} />}
          {phase === "busy" && (
            <View style={{ gap: 8 }}>
              <Row l="İndiriliyor…" r={`${pct}%`} strong />
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${pct}%` }]} />
              </View>
            </View>
          )}
          {phase === "done" && (
            <View style={styles.done}>
              <Text style={{ color: colors.primaryDark, fontWeight: "500" }}>
                ✓ İndirildi · çevrimdışı hazır
              </Text>
            </View>
          )}
        </View>
      </Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Switch
          value={wifiOnly}
          onValueChange={setWifiOnly}
          trackColor={{ true: colors.primary }}
        />
        <Text style={font.bodySecondary}>Yalnız Wi‑Fi'da indir</Text>
      </View>
      <View style={{ marginTop: "auto", gap: 10 }}>
        <Button label="Haritayı aç" size="xl" disabled={phase !== "done"} onPress={finish} />
        <Button
          label="Sonra indir, şimdi çevrimiçi kullan"
          variant="ghost"
          size="md"
          onPress={finish}
        />
      </View>
    </Screen>
  );
}

function Row({ l, r, strong }: { l: string; r: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={strong ? { color: colors.primaryDark, fontWeight: "500" } : font.bodySecondary}>
        {l}
      </Text>
      <Text style={{ color: colors.text, fontWeight: "500" }}>{r}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 150, backgroundColor: colors.mapBg, padding: 16 },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.primarySoft, overflow: "hidden" },
  fill: { height: 8, backgroundColor: colors.primary },
  done: { padding: 12, borderRadius: radius.sm + 2, backgroundColor: colors.primarySoft },
});
