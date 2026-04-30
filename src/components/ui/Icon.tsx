import type { CSSProperties } from "react";

interface Props {
  name: string;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, filled, className = "", style }: Props) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "fill" : ""} ${className}`.trim()}
      style={filled ? { fontVariationSettings: "'FILL' 1", ...style } : style}
      aria-hidden
    >
      {name}
    </span>
  );
}
