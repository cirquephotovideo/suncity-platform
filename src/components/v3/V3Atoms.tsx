import type { CSSProperties, ReactNode } from 'react';

export const V3 = {
  black: '#0A0A0A',
  deepblue: '#0a0820',
  magenta: '#FF006E',
  cyan: '#00F0FF',
  white: '#FFFFFF',
  cream: '#FFF1E6',
} as const;

export function ChromeText({
  children, size = 200, style = {}, gradient,
}: {
  children: ReactNode;
  size?: number;
  style?: CSSProperties;
  gradient?: string;
}) {
  const grad = gradient ?? `linear-gradient(180deg, ${V3.white} 0%, ${V3.cyan} 30%, ${V3.magenta} 60%, ${V3.white} 100%)`;
  return (
    <span style={{
      fontFamily: "var(--font-unbounded), sans-serif",
      fontWeight: 900,
      fontSize: size,
      lineHeight: 0.85,
      letterSpacing: '-0.04em',
      background: grad,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      filter: `drop-shadow(0 0 30px ${V3.magenta}88) drop-shadow(0 0 60px ${V3.cyan}55)`,
      display: 'inline-block',
      ...style,
    }}>
      {children}
    </span>
  );
}

export function Blob({
  size = 300, color = V3.magenta, style = {},
}: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${color}CC, ${color}00 70%)`,
      filter: 'blur(40px)',
      pointerEvents: 'none',
      ...style,
    }} />
  );
}

export function Pill({
  children, bg = V3.magenta, color = V3.white, glow = true, style = {},
}: { children: ReactNode; bg?: string; color?: string; glow?: boolean; style?: CSSProperties }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '10px 20px',
      background: bg,
      color,
      borderRadius: 999,
      fontFamily: 'var(--font-unbounded), sans-serif',
      fontWeight: 600, fontSize: 12, letterSpacing: 1.5,
      textTransform: 'uppercase',
      boxShadow: glow ? `0 0 20px ${bg}88, inset 0 1px 0 ${V3.white}66` : 'none',
      ...style,
    }}>
      {children}
    </span>
  );
}

export function Glass({
  children, style = {}, tone = 'magenta', padding = 32,
}: { children: ReactNode; style?: CSSProperties; tone?: 'magenta' | 'cyan'; padding?: number }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${V3.white}22 0%, ${V3.white}08 100%)`,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1.5px solid ${tone === 'magenta' ? V3.magenta : V3.cyan}55`,
      borderRadius: 28,
      padding,
      boxShadow: `inset 0 1px 0 ${V3.white}33, 0 8px 32px ${tone === 'magenta' ? V3.magenta : V3.cyan}22`,
      ...style,
    }}>
      {children}
    </div>
  );
}

export const v3RootStyle: CSSProperties = {
  width: '100%',
  minHeight: '100vh',
  background: `radial-gradient(ellipse at 20% 0%, ${V3.magenta}33 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, ${V3.cyan}33 0%, transparent 50%), ${V3.black}`,
  color: V3.white,
  fontFamily: 'var(--font-unbounded), sans-serif',
  position: 'relative',
  overflow: 'hidden',
};
