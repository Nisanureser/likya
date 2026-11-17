import { NEED_EMOJI, type NeedKind } from "@patika/shared";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { useSession } from "@/store/session";
import { Avatar, type AvatarSpec } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { ChevronIcon, LocateIcon, WaterIcon } from "@/ui/icons";
import { Screen } from "@/ui/Screen";
import { SosButton } from "@/ui/SosButton";
import { StatusStrip } from "@/ui/StatusStrip";
import { colors, font, radius, space } from "@/ui/theme";

/** Örnek yakındaki yürüyüşçüler; /presence/nearby bağlanınca yerini alacak. */
const DEMO_HIKERS: Array<{
  id: string;
  name: string;
  distKm: number;
  x: number;
  y: number;
  avatar: AvatarSpec;
  need?: NeedKind;
  note?: string;
}> = [
  {
    id: "ayse",
    name: "Ayşe",
    distKm: 1.2,
    x: 0.72,
    y: 0.38,
    avatar: { hair: "short", skin: "#F5C4B3", hairColor: "#2C2C2A", shirt: "#D85A30" },
    need: "water",
    note: "Çeşme kuruymuş, 1 litre yeter",
  },
  {
    id: "mehmet",
    name: "Mehmet",
    distKm: 2.8,
    x: 0.28,
    y: 0.33,
    avatar: { hair: "short", skin: "#B4B2A9", hairColor: "#2C2C2A", shirt: "#378ADD" },
    need: "power",
    note: "Telefonum %6",
  },
  {
    id: "lena",
    name: "Lena",
    distKm: 3.1,
    x: 0.82,
    y: 0.68,
    avatar: { hair: "curly", skin: "#F0997B", hairColor: "#412402", shirt: "#854F0B" },
  },
];

/**
 * Harita sekmesi. MapLibre ve çevrimdışı karolar veri hattı PMTiles üretince bağlanacak;
 * şimdilik çizim zemini üzerinde avatarlar, balonlar ve "sonraki su" kartı (prototip birebir).
 */
export default function HaritaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { avatar, visible, setProfile } = useSession();
  const [open, setOpen] = useState<string | null>(null);
  const picked = DEMO_HIKERS.find((h) => h.id === open);

  return (
    <Screen bare>
      <View style={styles.map}>
        <Svg width="100%" height="100%" viewBox="0 0 390 760" preserveAspectRatio="xMidYMid slice">
          <Path
            d="M0 420 L70 330 L130 390 L210 260 L290 350 L390 280 L390 760 L0 760 Z"
            fill="#DDEBC8"
          />
          <Path
            d="M0 560 L90 470 L170 530 L260 420 L340 500 L390 450 L390 760 L0 760 Z"
            fill={colors.mapHill}
          />
          <Path
            d="M-10 640 C60 600 90 520 150 480 S230 380 290 330 S350 240 410 230"
            stroke={colors.primary}
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M-10 640 C60 600 90 520 150 480 S230 380 290 330 S350 240 410 230"
            stroke={colors.mapBg}
            strokeWidth={2}
            strokeDasharray="6 10"
            fill="none"
          />
          <Circle cx={120} cy={505} r={8} fill={colors.water} stroke="#fff" strokeWidth={3} />
          <Circle cx={350} cy={255} r={8} fill={colors.lodging} stroke="#fff" strokeWidth={3} />
        </Svg>
        {DEMO_HIKERS.map((h) => (
          <Pressable
            key={h.id}
            accessibilityLabel={`${h.name}, ${h.distKm} km`}
            onPress={() => setOpen(open === h.id ? null : h.id)}
            style={[styles.hiker, { left: `${h.x * 100}%`, top: `${h.y * 100}%` }]}
          >
            <Avatar
              spec={h.avatar}
              size={44}
              bob
              bubble={h.need ? NEED_EMOJI[h.need] : undefined}
              bubbleColor={h.need === "water" ? colors.water : colors.hazard}
            />
            <Text style={styles.hikerLabel}>
              {h.name} · {h.distKm.toLocaleString("tr-TR")} km
            </Text>
          </Pressable>
        ))}
        <View style={[styles.hiker, { left: "50%", top: "57%" }]}>
          <Avatar spec={avatar} size={50} me />
          <Text style={[styles.hikerLabel, { color: colors.primaryDark, fontWeight: "600" }]}>
            Sen
          </Text>
        </View>
      </View>

      <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
        <View style={styles.row}>
          <StatusStrip extra="5 km içinde 3 yürüyüşçü, 2 ihtiyaç" />
          <SosButton />
        </View>
        <View style={styles.row}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Etap 12 · Kabak → Alınca</Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: visible }}
            onPress={() => setProfile({ visible: !visible })}
            style={[
              styles.chip,
              visible && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
            ]}
          >
            <View
              style={[styles.dot, { backgroundColor: visible ? colors.primary : colors.textMuted }]}
            />
            <Text style={[styles.chipText, !visible && { color: colors.textSecondary }]}>
              {visible ? "Görünürüm" : "Gizliyim"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.side}>
        <Pressable accessibilityLabel="Konumuma git" style={styles.iconBtn}>
          <LocateIcon />
        </Pressable>
        <Link href="/poi/alinca" asChild>
          <Pressable accessibilityLabel="Su noktaları" style={styles.iconBtn}>
            <WaterIcon size={20} />
          </Pressable>
        </Link>
      </View>

      <View style={[styles.bottom, { bottom: space.md }]}>
        {picked?.need ? (
          <Card style={{ gap: space.md }}>
            <View style={[styles.row, { alignItems: "center" }]}>
              <Avatar spec={picked.avatar} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={font.title}>
                  {picked.name} · {NEED_EMOJI[picked.need]}{" "}
                  {picked.need === "water" ? "Su lazım" : "Şarj lazım"}
                </Text>
                <Text style={font.bodySecondary}>
                  {picked.distKm.toLocaleString("tr-TR")} km · "{picked.note}"
                </Text>
              </View>
              <Pressable accessibilityLabel="Kapat" onPress={() => setOpen(null)} hitSlop={8}>
                <Text style={{ fontSize: 20, color: colors.textMuted }}>×</Text>
              </Pressable>
            </View>
            <View style={styles.row}>
              <Button
                label={picked.need === "water" ? "Su verebilirim 🙌" : "Yardım edebilirim 🙌"}
                size="md"
                style={{ flex: 1 }}
                onPress={() => router.push(`/ihtiyac/${picked.id}`)}
              />
              <Button
                label="Detay"
                variant="secondary"
                size="md"
                onPress={() => router.push(`/ihtiyac/${picked.id}`)}
              />
            </View>
          </Card>
        ) : (
          <>
            <Link href="/poi/alinca" asChild>
              <Pressable>
                <Card style={[styles.row, { alignItems: "center", paddingVertical: 12 }]}>
                  <Text style={{ fontSize: 22 }}>💧</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={font.caption}>Sonraki su · Alınca çeşmesi</Text>
                    <Text style={[font.h2, { fontSize: 18 }]}>
                      3,4 km{" "}
                      <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "500" }}>
                        · akıyor, 2 gün önce
                      </Text>
                    </Text>
                  </View>
                  <ChevronIcon />
                </Card>
              </Pressable>
            </Link>
            <Text style={[font.caption, { textAlign: "center", color: colors.textSecondary }]}>
              Balonlu bir avatara dokun, yardım teklif et.
            </Text>
          </>
        )}
        <Button label="🙋 Bir şeye ihtiyacım var" onPress={() => router.push("/ihtiyac")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.mapBg,
  },
  hiker: { position: "absolute", alignItems: "center", marginLeft: -22, marginTop: -22, gap: 4 },
  hikerLabel: { fontSize: 11, color: colors.textSecondary },
  top: { paddingHorizontal: space.lg, gap: space.sm + 2 },
  row: { flexDirection: "row", gap: space.sm + 2, alignItems: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontSize: 13, fontWeight: "500", color: colors.primaryDark },
  dot: { width: 8, height: 8, borderRadius: 4 },
  side: { position: "absolute", right: space.lg, top: 170, gap: space.sm },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: { position: "absolute", left: space.lg, right: space.lg, gap: space.sm + 2 },
});
