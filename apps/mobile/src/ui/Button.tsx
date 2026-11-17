import { Pressable, type PressableProps, StyleSheet, Text, type ViewStyle } from "react-native";
import { colors, radius } from "./theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg" | "xl";

interface Props extends Omit<PressableProps, "style"> {
  label: string;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle;
}

const heights: Record<Size, number> = { md: 44, lg: 52, xl: 56 };
const fontSizes: Record<Size, number> = { md: 14, lg: 16, xl: 17 };

/** Büyük dokunma hedefli, tek elle kullanılabilir düğme. */
export function Button({
  label,
  variant = "primary",
  size = "lg",
  style,
  disabled,
  ...rest
}: Props) {
  const bg =
    variant === "primary"
      ? disabled
        ? colors.border
        : colors.primary
      : variant === "danger"
        ? colors.danger
        : variant === "secondary"
          ? colors.card
          : "transparent";
  const fg =
    variant === "primary"
      ? disabled
        ? colors.textSecondary
        : colors.onPrimary
      : variant === "danger"
        ? colors.onDanger
        : variant === "secondary"
          ? colors.text
          : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          backgroundColor: bg,
          borderWidth: variant === "secondary" ? 1 : 0,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: pressed && variant === "ghost" ? 0.6 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.label, { color: fg, fontSize: fontSizes[size] }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  label: { fontWeight: "600" },
});
