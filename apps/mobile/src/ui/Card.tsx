import { StyleSheet, View, type ViewProps } from "react-native";
import { colors, radius, space } from "./theme";

interface Props extends ViewProps {
  tone?: "default" | "soft" | "water" | "lodging" | "danger";
  padded?: boolean;
}

const tones = {
  default: { backgroundColor: colors.card, borderColor: colors.border },
  soft: { backgroundColor: colors.primarySoft, borderColor: colors.mapHill },
  water: { backgroundColor: colors.waterSoft, borderColor: "#85B7EB" },
  lodging: { backgroundColor: colors.lodgingSoft, borderColor: "#EF9F27" },
  danger: { backgroundColor: colors.dangerSoft, borderColor: "#F09595" },
} as const;

/** Prototipteki beyaz, ince kenarlıklı, yuvarlatılmış kart. */
export function Card({ tone = "default", padded = true, style, ...rest }: Props) {
  return (
    <View style={[styles.card, tones[tone], padded && { padding: space.lg }, style]} {...rest} />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1 },
});
