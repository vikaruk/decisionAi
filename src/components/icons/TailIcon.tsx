import type { CSSProperties } from "react";

interface Props {
  style?: CSSProperties;
  className?: string;
  color?: string;
  colorTheme?: string;
  strokeColor?: string;
  strokeWidth?: number;
}
export default function TailIcon({ style, className, color, colorTheme,
  strokeColor,
  strokeWidth = 1,

}: Props) {
  return (
    <svg style={style} className={className} width="14" height="7" viewBox="0 0 14 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        stroke={strokeColor || "var(--color-border)"}
        strokeWidth={strokeWidth}
        fillRule="evenodd" clip-rule="evenodd" d="M0 0.000588071C4.01485 3.09543 8.65572 5.40708 12.2315 6.01467C13.1996 6.17915 13.4421 4.95757 12.7818 4.23083C11.7363 3.08001 11.1262 1.60158 10.8193 0C10.7919 0.000391605 10.7644 0.000588071 10.7369 0.000588071H0Z"
        fill={color || `var(--color-${colorTheme})` || "#edf8f0"} />
    </svg>
  );
}




