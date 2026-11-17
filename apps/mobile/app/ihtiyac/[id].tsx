import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Screen } from "@/ui/Screen";
import { colors, font, radius, space } from "@/ui/theme";

type Status = "open" | "offered" | "accepted" | "completed";
const ORDER: Status[] = ["open", "offered", "accepted", "completed"];
const LABEL: Record<Status, string> = {
  open: "Bekliyor",
  offered: "Teklif",
  accepted: "Kabul",
  completed: "Tamam",
};

/** İhtiyaç detayı ve teklif: open → offered → accepted → completed (prototip Teklif.dc.html). */
export default function IhtiyacDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("open");
  const idx = ORDER.indexOf(status);
  const isAyse = id !== "mehmet";

  return (
    <Screen title="İhtiyaç" back style={{ gap: space.md }}>
      <Card style={{ gap: 14 }}>
        <View style={styles.row}>
          <Avatar
            spec={
              isAyse
                ? { hair: "short", skin: "#F5C4B3", hairColor: "#2C2C2A", shirt: "#D85A30" }
                : { hair: "short", skin: "#B4B2A9", hairColor: "#2C2C2A", shirt: "#378ADD" }
            }
            size={64}
            bubble={isAyse ? "💧" : "🔋"}
            bubbleColor={isAyse ? colors.water : colors.hazard}
          />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[font.title, { fontSize: 18 }]}>
              {isAyse ? "Ayşe · Su lazım" : "Mehmet · Şarj lazım"}
            </Text>
            <Text style={font.bodySecondary}>TR · EN · orta deneyim · 12 dk önce</Text>
            <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "500" }}>
              {isAyse ? "1,2 km ileride, Alınca yönünde" : "2,8 km geride"}
            </Text>
          </View>
        </View>
        <Text style={[font.body, styles.quote]}>
          {isAyse
            ? '"Çeşme kuruymuş, 1 litre yeter. Yavaş yürüyorum, yetişirsin."'
            : '"Telefonum %6, powerbank ödünç alabilir miyim?"'}
        </Text>
        <View style={styles.steps}>
          {ORDER.map((s, i) => (
            <View key={s} style={{ flex: 1, alignItems: "center", gap: 4 }}>
              <View
                style={[
                  styles.step,
                  i <= idx && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: i <= idx ? colors.onPrimary : colors.textMuted,
                  }}
                >
                  {i < idx ? "✓" : i + 1}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: i <= idx ? colors.primaryDark : colors.textMuted,
                  fontWeight: i === idx ? "600" : "400",
                }}
              >
                {LABEL[s]}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {status === "open" && (
        <>
          <Button
            label={isAyse ? "Su verebilirim 🙌" : "Yardım edebilirim 🙌"}
            size="xl"
            onPress={() => setStatus("offered")}
          />
          <Text style={[font.caption, { textAlign: "center" }]}>
            Teklif edince bildirim gider; kabul ederse tam konumunuzu birbirinize açarsınız.
          </Text>
        </>
      )}
      {status === "offered" && (
        <>
          <Card tone="water" style={styles.row}>
            <Text style={{ fontSize: 22 }}>⏳</Text>
            <Text style={{ flex: 1, color: colors.waterDark }}>
              Teklifin gitti. Kabul edince haber veririz.
            </Text>
          </Card>
          <Button
            label="(prototip: kabul etti ▶)"
            variant="ghost"
            size="md"
            onPress={() => setStatus("accepted")}
          />
          <Button
            label="Teklifi geri çek"
            variant="secondary"
            size="md"
            onPress={() => setStatus("open")}
          />
        </>
      )}
      {status === "accepted" && (
        <>
          <Card tone="soft" style={{ gap: 12 }}>
            <Text style={[font.title, { color: colors.primaryDark }]}>
              Teklifin kabul edildi 🎉
            </Text>
            <Text style={{ color: colors.primaryDark }}>
              Artık tam konumu görebilirsin. 1,1 km, patika boyunca ~15 dk.
            </Text>
            <View style={styles.row}>
              <Button
                label="Haritada göster"
                variant="secondary"
                size="md"
                style={{ flex: 1 }}
                onPress={() => router.replace("/(tabs)/harita")}
              />
              <Button
                label="Mesaj yaz"
                variant="secondary"
                size="md"
                style={{ flex: 1 }}
                onPress={() => router.push(`/mesaj/${id}`)}
              />
            </View>
          </Card>
          <Button label="Verdim, tamamlandı ✓" size="xl" onPress={() => setStatus("completed")} />
        </>
      )}
      {status === "completed" && (
        <Card style={{ alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 40 }}>🙌</Text>
          <Text style={font.h2}>Teşekkürler!</Text>
          <Text style={[font.bodySecondary, { textAlign: "center" }]}>
            Balon indi. Bu sezon 3 kişiye yardım ettin.
          </Text>
          <Button
            label="Panoya dön"
            size="md"
            style={{ alignSelf: "stretch", marginTop: 6 }}
            onPress={() => router.replace("/(tabs)/pano")}
          />
        </Card>
      )}
      <Text
        style={[font.caption, { textAlign: "center", marginTop: "auto", marginBottom: space.lg }]}
      >
        Dayanışma ücretsizdir. Ücretli yerel hizmetler ayrı listelenir, karışmaz.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  quote: { padding: 12, borderRadius: radius.md, backgroundColor: colors.bg },
  steps: { flexDirection: "row" },
  step: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
});
