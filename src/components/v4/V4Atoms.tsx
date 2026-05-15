import type { CSSProperties, ReactNode } from 'react';

// ─── Palette Moon Daydream ────────────────────────────────────────────────────
export const V4 = {
  cream:    '#FFF6E0',   // fond principal chaud
  night:    '#0F1422',   // nuit marine profonde
  moon:     '#FFE5A0',   // jaune lune doux
  soft:     '#D4CBFF',   // lavande marine
  accent:   '#3D4D7C',   // bleu marine sature
  dusk:     '#1E2A4A',   // nuit intermédiaire
  mist:     '#F5EED8',   // cream légèrement plus sombre
  rose:     '#EAC5C5',   // blush rosé doux
} as const;

// ─── MoonPattern SVG ─────────────────────────────────────────────────────────
export function MoonPattern({
  size = 180,
  color = V4.moon,
  opacity = 0.13,
  id = 'moon-pattern',
}: {
  size?: number;
  color?: string;
  opacity?: number;
  id?: string;
}) {
  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          {/* Croissant principal */}
          <path
            d={`M ${size * 0.28} ${size * 0.17}
                A ${size * 0.14} ${size * 0.14} 0 1 0 ${size * 0.28} ${size * 0.44}
                A ${size * 0.10} ${size * 0.14} 0 1 1 ${size * 0.28} ${size * 0.17}`}
            fill={color}
            opacity={opacity}
          />
          {/* Petit croissant décalé */}
          <path
            d={`M ${size * 0.68} ${size * 0.57}
                A ${size * 0.09} ${size * 0.09} 0 1 0 ${size * 0.68} ${size * 0.75}
                A ${size * 0.065} ${size * 0.09} 0 1 1 ${size * 0.68} ${size * 0.57}`}
            fill={color}
            opacity={opacity * 0.7}
          />
          {/* Étoile ponctuelle */}
          <circle cx={size * 0.82} cy={size * 0.22} r={size * 0.018} fill={color} opacity={opacity * 0.5} />
          <circle cx={size * 0.12} cy={size * 0.78} r={size * 0.012} fill={color} opacity={opacity * 0.4} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// ─── EditorialText (Fraunces wonky) ──────────────────────────────────────────
export function EditorialText({
  children,
  size = 96,
  color,
  style = {},
  tag: Tag = 'span',
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  style?: CSSProperties;
  tag?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}) {
  return (
    <Tag
      style={{
        fontFamily: "'Fraunces', 'Playfair Display', 'Georgia', serif",
        fontWeight: 300,
        fontSize: size,
        lineHeight: 0.95,
        fontVariationSettings: '"opsz" 144, "WONK" 1, "SOFT" 100',
        letterSpacing: '-0.03em',
        display: 'block',
        color: color,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

// ─── MonoLabel ────────────────────────────────────────────────────────────────
export function MonoLabel({
  children,
  size = 11,
  color = V4.accent,
  style = {},
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', 'Space Mono', 'Courier New', monospace",
        fontSize: size,
        fontWeight: 400,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── SoftDivider ──────────────────────────────────────────────────────────────
export function SoftDivider({ color = V4.moon }: { color?: string }) {
  return (
    <div
      style={{
        width: 48,
        height: 1,
        background: color,
        opacity: 0.5,
        margin: '0 auto',
      }}
    />
  );
}

// ─── V4Section wrapper ────────────────────────────────────────────────────────
export function V4Section({
  children,
  bg = V4.cream,
  style = {},
}: {
  children: ReactNode;
  bg?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      style={{
        background: bg,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </section>
  );
}
