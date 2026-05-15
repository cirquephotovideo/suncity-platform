import { prisma } from '@/lib/prisma';
import { getSkin } from '@/lib/skins';

export async function PageHero({
  eyebrow, title, subtitle, coverImageUrl,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  coverImageUrl?: string | null;
}) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  const skin = getSkin(settings?.themeKey);

  // Style adapté selon skin
  const isClassic = skin.key === 'sun';
  const isV1Acid = skin.key === 'v1-acid';
  const isV2Techno = skin.key === 'v2-techno';
  const isV3Y2K = skin.key === 'v3-y2k';
  const isV4Moon = skin.key === 'v4-moon';

  const headerFontFamily =
    isV1Acid ? 'var(--font-big-shoulders), Impact, sans-serif' :
    isV2Techno ? "'JetBrains Mono', 'Space Mono', monospace" :
    isV3Y2K ? 'var(--font-unbounded), sans-serif' :
    isV4Moon ? "'Fraunces', 'Playfair Display', serif" :
    'var(--font-display), serif';

  const titleStyle: React.CSSProperties = isV1Acid ? {
    transform: 'scaleY(1.2) skewX(-3deg)',
    color: skin.accent,
    textTransform: 'uppercase',
    letterSpacing: '-0.04em',
  } : isV2Techno ? {
    color: skin.accent,
    textTransform: 'uppercase',
    letterSpacing: 4,
  } : isV3Y2K ? {
    background: `linear-gradient(180deg, #fff 0%, ${skin.accent} 50%, #00F0FF 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: `drop-shadow(0 0 30px ${skin.accent}88)`,
    letterSpacing: '-0.04em',
  } : isV4Moon ? {
    fontVariationSettings: '"opsz" 144, "WONK" 1, "SOFT" 80',
    color: skin.fg,
    fontStyle: 'italic',
  } : {};

  return (
    <section
      className="relative overflow-hidden"
      style={{
        padding: isClassic ? '80px 24px 64px' : '120px 24px 80px',
        background: coverImageUrl
          ? `linear-gradient(180deg, ${skin.bg}EE, ${skin.bg}AA), url(${coverImageUrl}) center/cover`
          : 'transparent',
        textAlign: 'center',
        color: skin.fg,
      }}
    >
      {/* Decorative glow per skin */}
      {(isV3Y2K || isV1Acid) && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at center top, ${skin.accent}33, transparent 60%)`,
        }} />
      )}

      <div className="relative z-10 max-w-4xl mx-auto">
        {eyebrow && (
          <p style={{
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: skin.accent,
            fontWeight: 600,
            marginBottom: 16,
            fontFamily: isV2Techno ? "'JetBrains Mono', monospace" : isV4Moon ? "'JetBrains Mono', monospace" : 'inherit',
          }}>
            {isV2Techno ? `// ${eyebrow}` : eyebrow}
          </p>
        )}
        <h1 style={{
          fontFamily: headerFontFamily,
          fontWeight: isV4Moon ? 400 : 900,
          fontSize: 'clamp(40px, 8vw, 96px)',
          lineHeight: 0.95,
          margin: 0,
          ...titleStyle,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            lineHeight: 1.5,
            color: skin.fg,
            opacity: 0.8,
            marginTop: 24,
            maxWidth: 600,
            marginInline: 'auto',
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
