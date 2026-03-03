// ── SpaceshipDot ──────────────────────────────────────────────────────────────

export interface SpaceshipDotProps {
  color: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SpaceshipDot({ color, size = 16, className, style }: SpaceshipDotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <circle cx="8" cy="8" r="6" fill={color} stroke="black" strokeWidth={4} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
