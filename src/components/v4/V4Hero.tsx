import type { CSSProperties } from 'react';
import { V4, EditorialText, MoonPattern, MonoLabel } from './V4Atoms';

interface V4HeroProps {
  locale: string;
  coverImageUrl?: string | null;
  siteName?: string;
  tagline?: string | null;
}

export default function V4Hero({
  locale,
  coverImageUrl,
  siteName = 'Sun City',
  tagline,
}: V4HeroProps) {
  const isFr = locale === 'fr';

  const headlineLine1 = isFr ? 'Le plus grand' : 'The largest';
  const headlineLine2 = isFr ? 'sauna gay' : 'gay sauna';
  const headlineLine3 = isFr ? 'de Paris.' : 'in Paris.';
  const sub = isFr
    ? '3 000 m²  ·  3 étages  ·  Ouvert 7j/7'
    : '3,000 sqm  ·  3 floors  ·  Open 7 days';
  const cta1 = isFr ? 'Réserver une entrée' : 'Book your entry';
  const cta2 = isFr ? 'Voir l\'agenda' : 'View agenda';

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        background: V4.night,
      }}
    >
      {/* Background image */}
      {coverImageUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            opacity: 0.28,
          }}
        />
      )}

      {/* Moon pattern overlay */}
      <MoonPattern size={220} color={V4.moon} opacity={0.08} id="hero-moon" />

      {/* Gradient bas */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, ${V4.night} 0%, ${V4.night}80 40%, transparent 100%)`,
        }}
      />

      {/* Contenu */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '0 60px 80px',
          maxWidth: 900,
        }}
      >
        <MonoLabel color={`${V4.moon}aa`} style={{ marginBottom: 32, display: 'block' }}>
          {isFr ? 'Paris · Sauna Privé · 18+' : 'Paris · Private Sauna · 18+'}
        </MonoLabel>

        <h1 style={{ margin: 0, padding: 0 }}>
          <EditorialText size={96} color={V4.cream} style={{ display: 'block' }}>
            {headlineLine1}
          </EditorialText>
          <EditorialText
            size={96}
            color={V4.moon}
            style={{
              display: 'block',
              fontVariationSettings: '"opsz" 144, "WONK" 1, "SOFT" 100',
              fontStyle: 'italic',
            }}
          >
            {headlineLine2}
          </EditorialText>
          <EditorialText size={96} color={`${V4.cream}80`} style={{ display: 'block' }}>
            {headlineLine3}
          </EditorialText>
        </h1>

        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            color: `${V4.cream}70`,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            margin: '32px 0 40px',
          }}
        >
          {sub}
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a
            href="/v4#tarifs"
            style={{
              display: 'inline-block',
              background: V4.moon,
              color: V4.night,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: 2,
            }}
          >
            {cta1}
          </a>
          <a
            href="/v4#agenda"
            style={{
              display: 'inline-block',
              border: `1px solid ${V4.cream}40`,
              color: V4.cream,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: 2,
            }}
          >
            {cta2}
          </a>
        </div>
      </div>

      {/* Indicateur scroll */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          zIndex: 10,
        }}
      >
        <MonoLabel size={9} color={`${V4.cream}40`}>scroll</MonoLabel>
        <div
          style={{
            width: 1,
            height: 48,
            background: `linear-gradient(to bottom, ${V4.cream}40, transparent)`,
          }}
        />
      </div>
    </section>
  );
}
