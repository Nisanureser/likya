/**
 * Tasarım token'ları — docs/tasarim-turu.md §5 "Toprak ve doğa" paleti.
 * Renkler prototipteki (docs/prototip) değerlerle birebir.
 */
export const colors = {
  bg: "#F4F1E8",
  card: "#FFFFFF",
  mapBg: "#EAF3DE",
  mapHill: "#C0DD97",
  primary: "#3B6D11",
  primaryDark: "#27500A",
  primarySoft: "#EAF3DE",
  text: "#173404",
  textSecondary: "#5F5E5A",
  textMuted: "#888780",
  border: "#D3D1C7",
  borderSoft: "#F1EFE8",
  water: "#378ADD",
  waterSoft: "#E6F1FB",
  waterDark: "#0C447C",
  lodging: "#854F0B",
  lodgingSoft: "#FAEEDA",
  lodgingDark: "#633806",
  hazard: "#BA7517",
  danger: "#A32D2D",
  dangerSoft: "#FCEBEB",
  dangerDark: "#501313",
  accent: "#D85A30",
  onPrimary: "#EAF3DE",
  onDanger: "#FFFFFF",
} as const;

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const font = {
  h1: { fontSize: 26, fontWeight: "600" as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: "600" as const, color: colors.text },
  title: { fontSize: 16, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 15, lineHeight: 21, color: colors.text },
  bodySecondary: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  caption: { fontSize: 12, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: "600" as const, color: colors.primaryDark },
} as const;

/** Hareket ilkeleri: 200–400 ms, spring; yürüyüş modunda sakinleşir. */
export const motion = {
  fast: 200,
  base: 300,
  slow: 400,
  spring: { damping: 14, stiffness: 180, mass: 0.8 },
} as const;

/** Avatar zemin rengi tişört rengine göre (prototip Avatar.dc.html ile aynı eşleme). */
export const avatarBgForShirt: Record<string, string> = {
  "#3B6D11": "#FAEEDA",
  "#D85A30": "#E1F5EE",
  "#378ADD": "#E6F1FB",
  "#534AB7": "#EEEDFE",
  "#854F0B": "#FAEEDA",
};
