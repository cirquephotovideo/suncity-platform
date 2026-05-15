import type { CSSProperties, ReactNode } from 'react';

export const V2 = {
  black:   '#000000',
  green:   '#00FF41',
  white:   '#FFFFFF',
  gray:    '#0D0D0D',
  gray2:   '#1A1A1A',
  gray3:   '#2A2A2A',
  dim:     '#00FF4133',
  dimText: '#00FF4188',
} as const;

const MONO = "'JetBrains Mono', 'Space Mono', 'Courier New', monospace";

export function MonoText({
  children,
  size = 12,
  color = V2.green,
  weight = 400,
  style = {},
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: size,
        color,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: weight,
        lineHeight: 1.4,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function GridLine({ vertical = false, opacity = 0.18 }: { vertical?: boolean; opacity?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        background: V2.green,
        opacity,
        ...(vertical
          ? { top: 0, bottom: 0, width: 1, left: '50%' }
          : { left: 0, right: 0, height: 1, top: '50%' }),
      }}
    />
  );
}

export function SchematicBox({
  children,
  label,
  style = {},
  labelPos = 'top-left',
}: {
  children?: ReactNode;
  label?: string;
  style?: CSSProperties;
  labelPos?: 'top-left' | 'top-right' | 'bottom-left';
}) {
  const cornerStyle: CSSProperties = {
    position: 'absolute',
    width: 8,
    height: 8,
    borderColor: V2.green,
    borderStyle: 'solid',
    opacity: 0.9,
  };

  return (
    <div
      style={{
        position: 'relative',
        border: `1px solid ${V2.green}22`,
        padding: '2px',
        ...style,
      }}
    >
      {/* corners */}
      <span style={{ ...cornerStyle, top: 0, left: 0, borderWidth: '1px 0 0 1px' }} />
      <span style={{ ...cornerStyle, top: 0, right: 0, borderWidth: '1px 1px 0 0' }} />
      <span style={{ ...cornerStyle, bottom: 0, left: 0, borderWidth: '0 0 1px 1px' }} />
      <span style={{ ...cornerStyle, bottom: 0, right: 0, borderWidth: '0 1px 1px 0' }} />
      {label && (
        <div
          style={{
            position: 'absolute',
            ...(labelPos === 'top-left' ? { top: -10, left: 8 } : labelPos === 'top-right' ? { top: -10, right: 8 } : { bottom: -10, left: 8 }),
            background: V2.black,
            padding: '0 4px',
            fontFamily: MONO,
            fontSize: 9,
            color: V2.green,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export function BlueprintBorder({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'relative',
        borderTop: `1px solid ${V2.green}`,
        borderBottom: `1px solid ${V2.green}`,
        padding: '24px 0',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function DataTag({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <MonoText size={9} color={V2.dimText}>[{label}]</MonoText>
      <MonoText size={11} color={V2.green} weight={700}>{String(value)}</MonoText>
    </div>
  );
}

export function TerminalLine({ prompt = '$', text }: { prompt?: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <MonoText size={10} color={V2.green} style={{ opacity: 0.5, flexShrink: 0 }}>{prompt}</MonoText>
      <MonoText size={10} color={V2.white}>{text}</MonoText>
    </div>
  );
}

export function SectionHeader({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <MonoText size={9} color={V2.green} style={{ opacity: 0.5 }}>// SECTION_{index}</MonoText>
        <div style={{ flex: 1, height: 1, background: `${V2.green}22` }} />
        <MonoText size={9} color={V2.green} style={{ opacity: 0.3 }}>EOF</MonoText>
      </div>
      <MonoText size={28} color={V2.green} weight={700} style={{ display: 'block', letterSpacing: '0.05em' }}>
        {title}
      </MonoText>
      {subtitle && (
        <MonoText size={11} color={V2.dimText} style={{ display: 'block', marginTop: 8 }}>
          {subtitle}
        </MonoText>
      )}
    </div>
  );
}
