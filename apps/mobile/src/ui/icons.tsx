import Svg, { Circle, Path, Rect } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

const base = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none" });
const stroke = (color: string, w = 2) => ({
  stroke: color,
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const MapIcon = ({ size = 24, color = "#888780" }: IconProps) => (
  <Svg {...base(size)}>
    <Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" {...stroke(color)} />
    <Path d="M8 2v16M16 6v16" {...stroke(color)} />
  </Svg>
);
export const StageIcon = ({ size = 24, color = "#888780" }: IconProps) => (
  <Svg {...base(size)}>
    <Path d="M3 20l6-14 4 8 3-5 5 11z" {...stroke(color)} />
  </Svg>
);
export const BoardIcon = ({ size = 24, color = "#888780" }: IconProps) => (
  <Svg {...base(size)}>
    <Rect x={4} y={3} width={16} height={18} rx={2} {...stroke(color)} />
    <Path d="M8 8h8M8 12h8M8 16h5" {...stroke(color)} />
  </Svg>
);
export const WaterIcon = ({ size = 24, color = "#185FA5" }: IconProps) => (
  <Svg {...base(size)}>
    <Path d="M12 2.7s-6 7-6 11.3a6 6 0 0 0 12 0C18 9.7 12 2.7 12 2.7z" {...stroke(color)} />
  </Svg>
);
export const ChevronIcon = ({ size = 20, color = "#888780" }: IconProps) => (
  <Svg {...base(size)}>
    <Path d="M9 6l6 6-6 6" {...stroke(color)} />
  </Svg>
);
export const LocateIcon = ({ size = 20, color = "#173404" }: IconProps) => (
  <Svg {...base(size)}>
    <Circle cx={12} cy={12} r={3} {...stroke(color)} />
    <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" {...stroke(color)} />
  </Svg>
);
export const PhoneIcon = ({ size = 24, color = "#A32D2D" }: IconProps) => (
  <Svg {...base(size)}>
    <Path
      d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"
      {...stroke(color, 2.2)}
    />
  </Svg>
);
export const CheckIcon = ({ size = 20, color = "#27500A" }: IconProps) => (
  <Svg {...base(size)}>
    <Path d="M20 6L9 17l-5-5" {...stroke(color, 2.5)} />
  </Svg>
);
export const PinIcon = ({ size = 22, color = "#3B6D11" }: IconProps) => (
  <Svg {...base(size)}>
    <Path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" {...stroke(color)} />
    <Circle cx={12} cy={10} r={2.5} {...stroke(color)} />
  </Svg>
);
export const BellIcon = ({ size = 22, color = "#3B6D11" }: IconProps) => (
  <Svg {...base(size)}>
    <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" {...stroke(color)} />
    <Path d="M13.7 21a2 2 0 0 1-3.4 0" {...stroke(color)} />
  </Svg>
);
