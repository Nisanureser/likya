import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSession } from "@/store/session";
import { Avatar } from "@/ui/Avatar";
import { Card } from "@/ui/Card";
import { ChevronIcon } from "@/ui/icons";
import { Screen } from "@/ui/Screen";
import { colors, font, radius, space } from "@/ui/theme";

export default function BenScreen() {
  const { nickname, avatar, signOut } = useSession();
  const router = useRouter();
  return (
    <Screen
      title="Ben"
      right={
        <Link href="/ayarlar" asChild>
          <Pressable accessibilityLabel="Ayarlar" style={styles.iconBtn}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </Pressable>
        </Link>
      }
    >
      <ScrollView
        contentContainerStyle={{ gap: space.md, paddingBottom: space.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.row, { padding: 14 }]}>
          <Pressable accessibilityLabel="Avatarı düzenle" onPress={() => router.push("/avatar")}>
            <Avatar spec={avatar} size={76} bob />
          </Pressable>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={font.h2}>{nickname || "Takma ad yok"}</Text>
            <Text style={font.bodySecondary}>TR · EN · orta deneyim</Text>
            <Text style={{ fontSize: 13, color: colors.primaryDark }}>
              "Yalnız yürüyorum, sohbete açığım."
            </Text>
          </View>
        </Card>
        <View style={styles.row}>
          {[
            ["3", "yardım ettin", colors.primarySoft, colors.primaryDark],
            ["7", "rapor verdin", colors.waterSoft, colors.waterDark],
            ["4", "etap bitirdin", colors.lodgingSoft, colors.lodgingDark],
          ].map(([n, l, bg, fg]) => (
            <View key={l} style={[styles.stat, { backgroundColor: bg }]}>
              <Text style={{ fontSize: 22, fontWeight: "600", color: fg }}>{n}</Text>
              <Text style={{ fontSize: 12, color: fg }}>{l}</Text>
            </View>
          ))}
        </View>
        <Card style={{ gap: 8 }}>
          <Text style={font.label}>Rozetler</Text>
          <View style={[styles.row, { flexWrap: "wrap" }]}>
            <Badge text="💧 Su kardeşi" bg={colors.waterSoft} fg={colors.waterDark} />
            <Badge text="🔋 Şarj meleği" bg={colors.lodgingSoft} fg={colors.lodgingDark} />
            <Badge text="🥾 4 etap" bg={colors.primarySoft} fg={colors.primaryDark} />
          </View>
        </Card>
        <Link href="/plan" asChild>
          <Pressable>
            <Card style={[styles.row, { padding: 14 }]}>
              <Text style={{ fontSize: 22 }}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={font.title}>Yürüyüş planı ve güvenilir kişi</Text>
                <Text style={font.caption}>Bugün: Alınca → Gey · Ayşe Y.</Text>
              </View>
              <ChevronIcon />
            </Card>
          </Pressable>
        </Link>
        <Pressable
          onPress={() => void signOut()}
          style={{ padding: space.md, alignItems: "center" }}
        >
          <Text style={{ color: colors.textSecondary }}>Çıkış yap</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function Badge({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <View
      style={{
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: radius.pill,
        backgroundColor: bg,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "600", color: fg }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  stat: { flex: 1, padding: 12, borderRadius: radius.md, alignItems: "center" },
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
});
