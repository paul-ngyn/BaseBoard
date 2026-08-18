import Svg, { Rect } from 'react-native-svg';

export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Rect x={3} y={6} width={24} height={4.2} rx={1} fill="#8a5a2b" />
      <Rect x={3} y={12.9} width={24} height={4.2} rx={1} fill="#a9581f" />
      <Rect x={3} y={19.8} width={24} height={4.2} rx={1} fill="#c39a5a" />
    </Svg>
  );
}
