import { NEED_EMOJI, NEED_KINDS, NEED_TTL_HOURS, type NeedKind } from "@patika/shared";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "@/store/session";
import { enqueue } from "@/sync/outbox";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { colors, font, radius, space } from "@/ui/theme";

const LABELS: Record<NeedKind, string> = {
  water: "Su",
  food: "Yiyecek",
  power: "Şarj",
  firstaid: "İlk yardım",
  lost: "Kayboldum",
  gear: "Ekipman",
  transport: "Ulaşım",
  lodging: "Konaklama",
  buddy: "Arkadaş",
  sos: "Acil",
};
const ttl = (k: NeedKind) =>
  NEED_TTL_HOURS[k] >= 48 ? `${NEED_TTL_HOURS[k] / 24} gün` : `${NEED_TTL_HOURS[k]} saat`;

/** İhtiyaç bildir: emoji seç → balon avatarın üstünde belirir → outbox'a yazılır. */
export default function IhtiyacScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const avatar = useSession((s) => s.avatar);
  const [kind, setKind] = useState<NeedKind | null>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  const submit = () => {
    if (!kind) {
      setError(true);
      return;
    }
    enqueue("need", { kind, note: note.trim() || null });
    setDone(true);
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + space.lg }]}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <Text style={font.h2}>{done ? "Balonun havada!" : "Neye ihtiyacın var?"}</Text>
        <Pressable accessibilityLabel="Kapat" onPress={() => router.back()} style={styles.close}>
          <Text style={{ fontSize: 20 }}>×</Text>
        </Pressable>
      </View>
      {!done ? (
        <>
          <View style={styles.preview}>
            <Avatar spec={avatar} size={72} bob bubble={kind ? NEED_EMOJI[kind] : undefined} />
            <Text style={[font.caption, { position: "absolute", bottom: 10 }]}>
              {kind ? "Haritada böyle görüneceksin" : "Bir ihtiyaç seç, balonun burada belirsin"}
            </Text>
          </View>
          <View style={styles.grid}>
            {NEED_KINDS.map((k) => (
              <Pressable
                key={k}
                accessibilityRole="radio"
                accessibilityState={{ selected: kind === k }}
                onPress={() => {
                  setKind(k);
                  setError(false);
                }}
                style={[
                  styles.kind,
                  kind === k && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primarySoft,
                  },
                ]}
              >
                <Text style={{ fontSize: 26 }}>{NEED_EMOJI[k]}</Text>
                <Text style={{ fontSize: 11, fontWeight: "500", color: colors.primaryDark }}>
                  {LABELS[k]}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{ gap: 6 }}>
            <Text style={font.label}>Kısaca anlat</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Örn. çeşme kuruymuş, 1 litre yeter"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>
          <Card style={[styles.row, { paddingVertical: 10 }]}>
            <Text style={font.bodySecondary}>
              Görünür: 5 km içindekiler · {kind ? ttl(kind) : "6–24 saat"}
            </Text>
            <Text style={font.caption}>konumun 250 m hücre</Text>
          </Card>
          <Button label="Balonu kaldır 🎈" size="xl" disabled={!kind} onPress={submit} />
          {error && (
            <Text style={{ color: colors.danger, fontSize: 13, textAlign: "center" }}>
              Önce bir ihtiyaç seç.
            </Text>
          )}
        </>
      ) : (
        <View style={{ alignItems: "center", gap: 14, paddingTop: 16 }}>
          <Avatar spec={avatar} size={96} bubble={kind ? NEED_EMOJI[kind] : undefined} />
          <Text style={[font.bodySecondary, { textAlign: "center", maxWidth: 290 }]}>
            Yakındaki yürüyüşçüler görüyor. Biri "verebilirim" deyince hemen haber vereceğiz.{" "}
            {kind ? ttl(kind) : ""} sonra kendiliğinden iner.
          </Text>
          <Button
            label="Haritada gör"
            size="lg"
            style={{ alignSelf: "stretch" }}
            onPress={() => router.back()}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: space.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    height: 130,
    borderRadius: radius.lg,
    backgroundColor: colors.mapBg,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kind: {
    width: "18%",
    flexGrow: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
