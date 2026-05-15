import { Link } from '@/i18n/routing';
import { V1, AcidText, GrainOverlay, Sticker, V1Pill } from './V1Atoms';
import { V1HeroEvents, type HeroEventItem } from './V1HeroEvents';

export function V1Hero({ events = [] }: { events?: HeroEventItem[] } = {}) {
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

      {/* Stickers déco */}
      <div style={{ position: 'absolute', top: 40, right: 80, zIndex: 2 }}>
        <Sticker bg={V1.red} color={V1.white} rotate={3}>
          ● OPEN 7J/7
        </Sticker>
      </div>
      <div style={{ position: 'absolute', top: 90, right: 200, zIndex: 2 }}>
        <Sticker bg={V1.black} color={V1.yellow} rotate={-2} style={{ border: `2px solid ${V1.yellow}` }}>
          ⊕ 75003 PARIS
        </Sticker>
      </div>

      {/* Texte principal */}
      <div style={{ position: 'relative', zIndex: 2 }}>
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
            § SAUNA GAY — PARIS 75003
          </span>
        </div>

        <div style={{ lineHeight: 0.82, marginBottom: 4 }}>
          <AcidText size={220} color={V1.yellow} style={{ display: 'block' }}>
            SUN
          </AcidText>
          <AcidText size={220} color={V1.white} skew={-2} style={{ display: 'block', marginTop: -12 }}>
            CITY
          </AcidText>
          <AcidText size={220} color={V1.red} skew={-4} style={{ display: 'block', marginTop: -12 }}>
            PARIS
          </AcidText>
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
          <Link href="/billetterie" style={{ textDecoration: 'none' }}>
            <V1Pill bg={V1.yellow} color={V1.black}>
              ENTRER 18+ →
            </V1Pill>
          </Link>
          <Link href="/agenda" style={{ textDecoration: 'none' }}>
            <V1Pill
              bg="transparent"
              color={V1.yellow}
              style={{ border: `2px solid ${V1.yellow}`, boxShadow: `4px 4px 0 ${V1.yellow}44` }}
            >
              VOIR L'AGENDA
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
