import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { SosButton } from "./SosButton";
import { colors, font, space } from "./theme";

interface Props {
  title?: string;
  subtitle?: string;
  back?: boolean;
  sos?: boolean;
  right?: ReactNode;
  children: ReactNode;
  style?: ViewStyle;
  /** Harita gibi tam ekran içerik: üst boşluk ve başlık yok. */
  bare?: boolean;
}

/** Ortak ekran kabuğu: güvenli alan, başlık, geri düğmesi, SOS. */
export function Screen({ title, subtitle, back, sos = true, right, children, style, bare }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  if (bare) return <View style={[styles.root, style]}>{children}</View>;
  return (
    <View style={[styles.root, { paddingTop: insets.top + space.sm }]}>
      <View style={styles.header}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Geri"
            onPress={() => router.back()}
            style={styles.back}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18l-6-6 6-6"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          {title && <Text style={font.h1}>{title}</Text>}
          {subtitle && <Text style={font.caption}>{subtitle}</Text>}
        </View>
        {right}
        {sos && <SosButton />}
      </View>
      <View style={[styles.body, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, paddingHorizontal: space.lg },
});
