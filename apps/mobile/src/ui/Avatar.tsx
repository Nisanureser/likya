import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { avatarBgForShirt, colors } from "./theme";

/** Çizgi karakter avatar tanımı (tasarım kararı: fotoğraf yok, kimlik gizli). */
export interface AvatarSpec {
  hair: "long" | "short" | "curly";
  skin: string;
  hairColor: string;
  shirt: string;
  hat?: boolean;
  pack?: boolean;
}

export const DEFAULT_AVATAR: AvatarSpec = {
  hair: "long",
  skin: "#F0997B",
  hairColor: "#854F0B",
  shirt: "#3B6D11",
  pack: true,
};

export const AVATAR_OPTIONS = {
  skins: ["#F5C4B3", "#F0997B", "#B4B2A9", "#854F0B"],
  hairColors: ["#854F0B", "#2C2C2A", "#EF9F27"],
  shirts: ["#3B6D11", "#D85A30", "#378ADD", "#534AB7"],
  hairs: [
    ["long", "Uzun"],
    ["short", "Kısa"],
    ["curly", "Kıvırcık"],
  ] as const,
};

interface Props {
  spec?: AvatarSpec;
  size?: number;
  /** Üstte ihtiyaç balonu (emoji). */
  bubble?: string;
  bubbleColor?: string;
  /** Hafif zıplama; yürüyüş modunda ve "animasyonları azalt" açıkken kapatılır. */
  bob?: boolean;
  /** Kullanıcının kendisi: nabız halkası. */
  me?: boolean;
  face?: boolean;
}

/** Prototipteki (docs/prototip/Avatar.dc.html) SVG avatarın birebir React Native sürümü. */
export function Avatar({
  spec = DEFAULT_AVATAR,
  size = 48,
  bubble,
  bubbleColor = colors.primary,
  bob = false,
  me = false,
  face = true,
}: Props) {
  const y = useSharedValue(0);
  useEffect(() => {
    if (!bob) {
      y.value = withTiming(0, { duration: 200 });
      return;
    }
    y.value = withRepeat(
      withSequence(
        withTiming(-size * 0.1, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [bob, size, y]);
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  const bg = avatarBgForShirt[spec.shirt] ?? "#FAEEDA";
  const r = 50;
  return (
    <Animated.View style={[{ width: size, height: size }, bobStyle]}>
      {me && <PulseRing size={size} />}
      <Svg width={size} height={size} viewBox="-55 -55 110 110">
        <Circle r={r + 4} fill="#FFFFFF" />
        <Circle r={r} fill={bg} />
        <Circle cy={-11} r={19} fill={spec.skin} />
        <Path d="M-29 38c1-19 14-27 29-27s28 8 29 27" fill={spec.shirt} />
        {spec.pack && <Rect x={17} y={4} width={17} height={28} rx={7} fill="#854F0B" />}
        {face && (
          <>
            <Circle cx={-7} cy={-13} r={2.4} fill="#4A1B0C" />
            <Circle cx={7} cy={-13} r={2.4} fill="#4A1B0C" />
            <Path
              d="M-7 -4q7 6 14 0"
              stroke="#4A1B0C"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
        {spec.hair === "long" && (
          <Path d="M-21 -13q21-29 42 0 v13 q-21 -8 -42 0z" fill={spec.hairColor} />
        )}
        {spec.hair === "short" && <Path d="M-19 -17c3-17 35-17 38 0z" fill={spec.hairColor} />}
        {spec.hair === "curly" && (
          <>
            <Circle cx={-13} cy={-23} r={9} fill={spec.hairColor} />
            <Circle cx={0} cy={-29} r={10} fill={spec.hairColor} />
            <Circle cx={13} cy={-23} r={9} fill={spec.hairColor} />
          </>
        )}
        {spec.hat && (
          <>
            <Path d="M-29 -21h58l-6 -6h-46z" fill="#2C2C2A" />
            <Rect x={-19} y={-38} width={38} height={17} rx={6} fill="#2C2C2A" />
          </>
        )}
      </Svg>
      {bubble && (
        <View
          style={[
            styles.bubble,
            {
              borderColor: bubbleColor,
              right: -size * 0.22,
              top: -size * 0.3,
              width: size * 0.62,
              height: size * 0.56,
              borderRadius: size * 0.22,
            },
          ]}
        >
          <Text style={{ fontSize: size * 0.3 }}>{bubble}</Text>
        </View>
      )}
    </Animated.View>
  );
}

function PulseRing({ size }: { size: number }) {
  const s = useSharedValue(1);
  const o = useSharedValue(0.45);
  useEffect(() => {
    s.value = withRepeat(withTiming(2.2, { duration: 1900, easing: Easing.out(Easing.quad) }), -1);
    o.value = withRepeat(withTiming(0, { duration: 1900 }), -1);
  }, [s, o]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: o.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: size / 2, backgroundColor: colors.primary },
        st,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
