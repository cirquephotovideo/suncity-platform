import { Link } from '@/i18n/routing';
import { V1, AcidText, GrainOverlay, Sticker, V1Pill } from './V1Atoms';
import { V1HeroEvents, type HeroEventItem } from './V1HeroEvents';

export type HeroBanner = {
  title: string;          // ex "SUN CITY PARIS" or "BOLLYWOOD PARTY"
  eyebrow?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  ctaUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl2?: string | null;
  ctaLabel2?: string | null;
  accentColor?: string | null;
};

const COLORS = [V1.yellow, V1.white, V1.red, V1.cream];

/**
 * Splits a title into up to 3 stylable lines for the giant Acid typography.
 * "SUN CITY PARIS" → ["SUN", "CITY", "PARIS"]
 * "BOLLYWOOD PARTY" → ["BOLLYWOOD", "PARTY"]
 * "PRIDE" → ["PRIDE"]
 */
function splitTitleLines(title: string): string[] {
  const cleaned = title.trim().toUpperCase().replace(/\s+/g, ' ');
  const words = cleaned.split(' ').filter(Boolean);
  if (words.length <= 3) return words;
  // Group long titles into roughly-equal halves
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

export function V1Hero({
  events = [],
  banner,
}: {
  events?: HeroEventItem[];
  banner?: HeroBanner | null;
} = {}) {
  const lines = splitTitleLines(banner?.title || 'SUN CITY PARIS');
  const eyebrow = banner?.eyebrow || '§ SAUNA GAY — PARIS 75003';
  const ctaUrl = banner?.ctaUrl || '/billetterie';
  const ctaLabel = banner?.ctaLabel || 'ENTRER 18+ →';
  const ctaUrl2 = banner?.ctaUrl2 || '/agenda';
  const ctaLabel2 = banner?.ctaLabel2 || "VOIR L'AGENDA";

  // Pick a font size that fits — smaller for longer single-word lines
  const longest = Math.max(...lines.map(l => l.length), 1);
  const fontSize = longest <= 5 ? 220 : longest <= 8 ? 170 : longest <= 12 ? 130 : 100;

  return (
    <section
      style={{
        position: 'relative',
        minHeight: 780,
        background: V1.black,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 48px 80px',
        overflow: 'hidden',
      }}
    >
      <GrainOverlay opacity={0.09} />

      {/* MEDIA HERO (image ou vidéo de la bannière) */}
      {banner?.videoUrl && (
        <video
          src={banner.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: '36%',
            right: '24%',
            bottom: 0,
            width: '40%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.85,
            zIndex: 1,
            filter: 'contrast(1.05) saturate(1.1)',
            mixBlendMode: 'screen',
          }}
        />
      )}
      {!banner?.videoUrl && banner?.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.imageUrl}
          alt={banner.title}
          style={{
            position: 'absolute',
            top: 0,
            left: '36%',
            right: '24%',
            bottom: 0,
            width: '40%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.9,
            zIndex: 1,
            filter: 'contrast(1.05) saturate(1.1)',
          }}
        />
      )}

      {/* Vignette dégradé pour bien fondre l'image dans le noir */}
      {(banner?.imageUrl || banner?.videoUrl) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            background:
              'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.85) 32%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.85) 72%, #000 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Blocs déco background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 340,
          height: '100%',
          background: V1.yellow,
          opacity: 0.06,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: V1.red,
          opacity: 0.08,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Stickers déco (haut-droit) */}
      <div style={{ position: 'absolute', top: 40, right: 80, zIndex: 4 }}>
        <Sticker bg={V1.red} color={V1.white} rotate={3}>
          ● OPEN 7J/7
        </Sticker>
      </div>
      <div style={{ position: 'absolute', top: 90, right: 200, zIndex: 4 }}>
        <Sticker bg={V1.black} color={V1.yellow} rotate={-2} style={{ border: `2px solid ${V1.yellow}` }}>
          ⊕ 75003 PARIS
        </Sticker>
      </div>

      {/* Texte principal (gauche) */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '55%' }}>
        <div style={{ marginBottom: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: 5,
              color: V1.yellow,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </span>
        </div>

        <div style={{ lineHeight: 0.82, marginBottom: 4 }}>
          {lines.map((line, i) => (
            <AcidText
              key={i}
              size={fontSize}
              color={COLORS[i % COLORS.length]}
              skew={i === 0 ? 0 : -2 - i * 1.5}
              style={{ display: 'block', marginTop: i === 0 ? 0 : -12 }}
            >
              {line}
            </AcidText>
          ))}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-big-shoulders), sans-serif',
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 1,
            color: V1.cream,
            marginTop: 32,
            maxWidth: 640,
            lineHeight: 1.3,
          }}
        >
          Le plus grand sauna gay de Paris.
          <br />
          <span style={{ color: V1.yellow }}>3000 m².</span>
          &nbsp;
          <span style={{ color: V1.red }}>3 étages.</span>
          &nbsp;
          <span style={{ color: V1.cream, opacity: 0.8 }}>Zero filter.</span>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 48 }}>
          <Link href={ctaUrl} style={{ textDecoration: 'none' }}>
            <V1Pill bg={banner?.accentColor || V1.yellow} color={V1.black}>
              {ctaLabel}
            </V1Pill>
          </Link>
          <Link href={ctaUrl2} style={{ textDecoration: 'none' }}>
            <V1Pill
              bg="transparent"
              color={V1.yellow}
              style={{ border: `2px solid ${V1.yellow}`, boxShadow: `4px 4px 0 ${V1.yellow}44` }}
            >
              {ctaLabel2}
            </V1Pill>
          </Link>
        </div>
      </div>

      {/* Ticker événements (côté droit) */}
      <V1HeroEvents items={events} />

      {/* Numéro déco vertical */}
      <div
        style={{
          position: 'absolute',
          right: 56,
          bottom: 60,
          fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
          fontWeight: 900,
          fontSize: 220,
          lineHeight: 1,
          color: V1.yellow,
          opacity: 0.04,
          letterSpacing: '-0.06em',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        01
      </div>
    </section>
  );
}
