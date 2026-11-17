import { Link } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "@/ui/Card";
import { Screen } from "@/ui/Screen";
import { colors, font, radius, space } from "@/ui/theme";

/** Örnek etaplar; SQLite `stages` tablosuna bağlanınca yerini alacak. */
const STAGES = [
  {
    n: 10,
    name: "Faralya → Kabak",
    meta: "7,8 km · ▲ 420 m · 3,5 sa",
    water: "2 su",
    lodging: "3 pansiyon",
  },
  {
    n: 11,
    name: "Kabak → Alınca",
    meta: "6,2 km · ▲ 540 m · 3 sa",
    water: "1 su",
    lodging: "2 pansiyon",
  },
  {
    n: 12,
    name: "Alınca → Gey",
    meta: "11,4 km · ▲ 310 m · 4,5 sa",
    water: "3 su",
    lodging: "1 pansiyon",
    active: true,
  },
  { n: 13, name: "Gey → Bel", meta: "9,1 km · ▲ 380 m · 4 sa", water: "1 su", lodging: "kamp" },
  {
    n: 14,
    name: "Bel → Sidyma",
    meta: "12,7 km · ▲ 260 m · 5 sa",
    water: "2 su",
    lodging: "2 pansiyon",
  },
  {
    n: 15,
    name: "Sidyma → Bozburun",
    meta: "10,3 km · ▲ 450 m · 4,5 sa",
    water: "0 su",
    lodging: "kamp",
  },
];

export default function EtaplarScreen() {
  return (
    <Screen title="Etaplar" style={{ paddingHorizontal: 0 }}>
      <View style={styles.filters}>
        <View style={[styles.chip, styles.chipOn]}>
          <Text style={[styles.chipText, { color: colors.onPrimary }]}>Tümü · 29</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Batı</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Doğu</Text>
        </View>
      </View>
      <FlatList
        data={STAGES}
        keyExtractor={(s) => String(s.n)}
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: 10 }}
        renderItem={({ item: s }) => (
          <Link href={`/etap/${s.n}`} asChild>
            <Pressable>
              <Card style={[styles.row, s.active && { borderColor: colors.primary }]}>
                <View style={[styles.num, s.active && { backgroundColor: colors.primary }]}>
                  <Text style={[styles.numText, s.active && { color: colors.onPrimary }]}>
                    {s.n}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={font.title}>{s.name}</Text>
                  <Text style={font.bodySecondary}>{s.meta}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 2 }}>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: "#185FA5" }}>
                    {s.water}
                  </Text>
                  <Text style={font.caption}>{s.lodging}</Text>
                </View>
              </Card>
            </Pressable>
          </Link>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", gap: 8, paddingHorizontal: space.lg, paddingBottom: space.md },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "500", color: colors.textSecondary },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  num: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  numText: { fontSize: 15, fontWeight: "600", color: colors.primaryDark },
});
