import { NEED_EMOJI, type NeedKind } from "@patika/shared";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar, type AvatarSpec } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Screen } from "@/ui/Screen";
import { colors, font, radius, space } from "@/ui/theme";

type Need = {
  id: string;
  who: string;
  when: string;
  kind: NeedKind;
  text: string;
  status: "open" | "offered" | "completed";
  dist: string;
  avatar: AvatarSpec;
};

const NEEDS: Need[] = [
  {
    id: "ayse",
    who: "Ayşe",
    when: "12 dk",
    kind: "water",
    text: "Çeşme kuruymuş, 1 litre yeter. Alınca yolunda ilerliyorum.",
    status: "open",
    dist: "1,2 km ileride",
    avatar: { hair: "short", skin: "#F5C4B3", hairColor: "#2C2C2A", shirt: "#D85A30" },
  },
  {
    id: "mehmet",
    who: "Mehmet",
    when: "40 dk",
    kind: "power",
    text: "Telefonum %6, powerbank ödünç alabilir miyim? Gey'de akşam iade ederim.",
    status: "offered",
    dist: "2,8 km geride",
    avatar: { hair: "short", skin: "#B4B2A9", hairColor: "#2C2C2A", shirt: "#378ADD" },
  },
  {
    id: "me",
    who: "Sen",
    when: "dün",
    kind: "buddy",
    text: "Yarın Gey → Bel etabı için yürüyüş arkadaşı arıyorum, 08:00 çıkış.",
    status: "completed",
    dist: "Lena katıldı",
    avatar: { hair: "long", skin: "#F0997B", hairColor: "#854F0B", shirt: "#3B6D11", pack: true },
  },
];
const PEOPLE = [
  {
    who: "Lena",
    langs: "DE · EN",
    plan: "Bu gece Alınca, yarın Gey",
    avatar: {
      hair: "curly",
      skin: "#F0997B",
      hairColor: "#412402",
      shirt: "#854F0B",
    } as AvatarSpec,
  },
  {
    who: "Ayşe",
    langs: "TR · EN",
    plan: "Kabak'tan çıktı, Alınca'ya gidiyor",
    avatar: NEEDS[0]!.avatar,
  },
  {
    who: "Mehmet",
    langs: "TR",
    plan: "Yavaş gidiyor, Alınca'da kalacak",
    avatar: NEEDS[1]!.avatar,
  },
  {
    who: "Tom & Jo",
    langs: "EN",
    plan: "Kamp, Gey öncesi dere kenarı",
    avatar: {
      hair: "short",
      skin: "#F5C4B3",
      hairColor: "#EF9F27",
      shirt: "#534AB7",
    } as AvatarSpec,
  },
];
const STATUS = {
  open: { label: "Bekliyor", bg: colors.lodgingSoft, fg: colors.lodgingDark },
  offered: { label: "Teklif var · Lena", bg: colors.waterSoft, fg: colors.waterDark },
  completed: { label: "Tamamlandı ✓", bg: colors.primarySoft, fg: colors.primaryDark },
};

export default function PanoScreen() {
  const [tab, setTab] = useState<"needs" | "here">("needs");
  const router = useRouter();
  return (
    <Screen title="Pano" subtitle="Etap 12 civarı · bugün" style={{ paddingHorizontal: 0 }}>
      <View style={styles.tabs}>
        {(["needs", "here"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.chip, tab === t && styles.chipOn]}
          >
            <Text style={[styles.chipText, tab === t && { color: colors.onPrimary }]}>
              {t === "needs" ? "İhtiyaçlar · 2" : "Bu etaptakiler · 5"}
            </Text>
          </Pressable>
        ))}
      </View>
      {tab === "needs" ? (
        <FlatList
          data={NEEDS}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: n }) => (
            <Link href={`/ihtiyac/${n.id}`} asChild>
              <Pressable>
                <Card style={[styles.row, { alignItems: "flex-start" }]}>
                  <Avatar
                    spec={n.avatar}
                    size={52}
                    bubble={NEED_EMOJI[n.kind]}
                    bubbleColor={n.status === "open" ? colors.water : colors.border}
                  />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={font.title}>
                      {n.who} <Text style={font.caption}>· {n.when}</Text>
                    </Text>
                    <Text style={font.body}>{n.text}</Text>
                    <View style={[styles.row, { marginTop: 2 }]}>
                      <View style={[styles.badge, { backgroundColor: STATUS[n.status].bg }]}>
                        <Text
                          style={{ fontSize: 12, fontWeight: "600", color: STATUS[n.status].fg }}
                        >
                          {STATUS[n.status].label}
                        </Text>
                      </View>
                      <Text style={font.caption}>{n.dist}</Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </Link>
          )}
        />
      ) : (
        <FlatList
          data={PEOPLE}
          keyExtractor={(p) => p.who}
          contentContainerStyle={styles.list}
          renderItem={({ item: p }) => (
            <Card style={[styles.row, { paddingVertical: 12 }]}>
              <Avatar spec={p.avatar} size={44} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={font.title}>
                  {p.who} <Text style={font.caption}>{p.langs}</Text>
                </Text>
                <Text style={font.bodySecondary}>{p.plan}</Text>
              </View>
              <Button label="Selam 👋" variant="secondary" size="md" />
            </Card>
          )}
        />
      )}
      <View style={{ padding: space.lg, paddingTop: space.sm }}>
        <Button label="🙋 Bir şeye ihtiyacım var" onPress={() => router.push("/ihtiyac")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: space.lg, paddingBottom: space.md },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  list: { paddingHorizontal: space.lg, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill },
});
