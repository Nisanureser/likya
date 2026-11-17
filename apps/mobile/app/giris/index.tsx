import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { Button } from "@/ui/Button";
import { colors, font, radius, space } from "@/ui/theme";

/** Hoş geldin: dil seçimi ve değer önerisi. */
export default function HosGeldin() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [lang, setLang] = useState<"tr" | "en">("tr");
  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <View style={styles.langs}>
        {(["tr", "en"] as const).map((l) => (
          <Pressable
            key={l}
            onPress={() => setLang(l)}
            style={[styles.lang, lang === l && styles.langOn]}
          >
            <Text style={[styles.langText, lang === l && { color: colors.onPrimary }]}>
              {l === "tr" ? "Türkçe" : "English"}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flex: 1, justifyContent: "center", gap: 28 }}>
        <View style={styles.hero}>
          <Svg width={280} height={280} viewBox="0 0 280 280">
            <Path
              d="M0 250 L70 170 L120 220 L190 120 L240 180 L280 140 L280 280 L0 280 Z"
              fill={colors.mapHill}
            />
            <Path
              d="M-10 230 C60 180 90 210 140 150 S220 90 300 60"
              stroke={colors.primary}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray="14 12"
              fill="none"
            />
            <Circle cx={90} cy={195} r={10} fill={colors.water} />
            <Circle cx={200} cy={110} r={10} fill={colors.lodging} />
            <Circle
              cx={140}
              cy={150}
              r={14}
              fill="#FFFFFF"
              stroke={colors.primary}
              strokeWidth={5}
            />
          </Svg>
        </View>
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 34, fontWeight: "600", color: colors.text }}>Patika</Text>
          <Text style={{ fontSize: 18, lineHeight: 25, color: colors.primaryDark }}>
            Likya Yolu için çevrimdışı rehber, güvenlik ve dayanışma.
          </Text>
          <Text style={font.bodySecondary}>
            Harita, etaplar ve su noktaları sinyal olmadan da çalışır. Yürüyüş planını paylaş,
            "vardım" de, ihtiyacını etap panosuna yaz.
          </Text>
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <Button label="Başla" size="xl" onPress={() => router.push("/giris/kod")} />
        <Text style={[font.caption, { textAlign: "center" }]}>
          Devam ederek kullanım koşullarını kabul edersin.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.xl, gap: space.xl },
  langs: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  lang: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  langOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  langText: { fontSize: 14, fontWeight: "500", color: colors.textSecondary },
  hero: {
    width: 280,
    height: 280,
    alignSelf: "center",
    borderRadius: radius.xl,
    backgroundColor: colors.mapBg,
    overflow: "hidden",
  },
});
