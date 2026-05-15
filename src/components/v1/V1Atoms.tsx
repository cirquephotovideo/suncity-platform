import type { CSSProperties, ReactNode } from 'react';

// ─── Palette V1 Acid Flyer ───
export const V1 = {
  yellow:  '#FFEE00',
  red:     '#FF3300',
  orange:  '#FF6600',
  black:   '#000000',
  cream:   '#FFF6E0',
  white:   '#FFFFFF',
  darkgray:'#111111',
} as const;

// ─── AcidText : titre rave stretched uppercase ───
export function AcidText({
  children,
  size = 180,
  color = V1.yellow,
  skew = -3,
  scaleY = 1.35,
  style = {},
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  skew?: number;
  scaleY?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-big-shoulders), "Impact", "Arial Black", sans-serif',
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.85,
        letterSpacing: '-0.03em',
        textTransform: 'uppercase',
        color,
        display: 'inline-block',
        transform: `scaleY(${scaleY}) skewX(${skew}deg)`,
        transformOrigin: 'bottom left',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Marquee : bandeau défilant horizontal ───
export function Marquee({
  children,
  speed = 25,
  bg = V1.yellow,
  color = V1.black,
  py = 14,
  fontSize = 18,
  style = {},
}: {
  children: ReactNode;
  speed?: number;
  bg?: string;
  color?: string;
  py?: number;
  fontSize?: number;
  style?: CSSProperties;
}) {
  const inner: CSSProperties = {
    display: 'inline-flex',
    whiteSpace: 'nowrap',
    animation: `v1marquee ${speed}s linear infinite`,
    gap: 0,
  };

  return (
    <>
      <style>{`
        @keyframes v1marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        style={{
          overflow: 'hidden',
          background: bg,
          color,
          fontFamily: 'var(--font-big-shoulders), "Impact", "Arial Black", sans-serif',
          fontWeight: 900,
          fontSize,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          paddingTop: py,
          paddingBottom: py,
          ...style,
        }}
      >
        <div style={inner}>
          {/* Duplicate to create seamless loop */}
          <span>{children}&nbsp;&nbsp;★&nbsp;&nbsp;{children}&nbsp;&nbsp;★&nbsp;&nbsp;{children}&nbsp;&nbsp;★&nbsp;&nbsp;{children}&nbsp;&nbsp;★&nbsp;&nbsp;</span>
          <span>{children}&nbsp;&nbsp;★&nbsp;&nbsp;{children}&nbsp;&nbsp;★&nbsp;&nbsp;{children}&nbsp;&nbsp;★&nbsp;&nbsp;{children}&nbsp;&nbsp;★&nbsp;&nbsp;</span>
        </div>
      </div>
    </>
  );
}

// ─── Sticker : badge fluo décalé rave ───
export function Sticker({
  children,
  bg = V1.red,
  color = V1.white,
  rotate = -3,
  style = {},
}: {
  children: ReactNode;
  bg?: string;
  color?: string;
  rotate?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color,
        fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
        fontWeight: 900,
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
        padding: '6px 14px',
        transform: `rotate(${rotate}deg)`,
        boxShadow: `4px 4px 0 ${V1.black}`,
        border: `2px solid ${V1.black}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── GrainOverlay : texture grain SVG ───
export function GrainOverlay({ opacity = 0.06, style = {} }: { opacity?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
        ...style,
      }}
    />
  );
}

// ─── RaveTag : petit label section type §01 ───
export function RaveTag({ children, color = V1.yellow }: { children: ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
        fontWeight: 900,
        fontSize: 12,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color,
        border: `1.5px solid ${color}`,
        padding: '4px 12px',
        marginBottom: 20,
      }}
    >
      {children}
    </span>
  );
}

// ─── Pill V1 : bouton CTA style flyer ───
export function V1Pill({
  children,
  bg = V1.yellow,
  color = V1.black,
  style = {},
}: {
  children: ReactNode;
  bg?: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color,
        fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
        fontWeight: 900,
        fontSize: 15,
        letterSpacing: 2,
        textTransform: 'uppercase',
        padding: '14px 32px',
        border: `2px solid ${V1.black}`,
        boxShadow: `4px 4px 0 ${V1.black}`,
        cursor: 'pointer',
        textDecoration: 'none',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Style root ───
export const v1RootStyle: CSSProperties = {
  width: '100%',
  minHeight: '100vh',
  background: V1.black,
  color: V1.cream,
  fontFamily: 'var(--font-big-shoulders), "Impact", "Arial Black", sans-serif',
  position: 'relative',
  overflowX: 'hidden',
};
