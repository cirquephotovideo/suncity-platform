import { V1, Marquee, GrainOverlay, AcidText } from './V1Atoms';

const FACTS = [
  { big: '3000', unit: 'M²', label: 'DE PLAISIR' },
  { big: '3',    unit: 'ÉTAGES', label: 'À EXPLORER' },
  { big: '7/7',  unit: 'JOURS', label: 'OUVERT' },
  { big: '14H',  unit: 'NON-STOP', label: 'VEN-SAM-DIM' },
];

export function V1Strip() {
  return (
    <>
      {/* Marquee jaune */}
      <Marquee
        bg={V1.yellow}
        color={V1.black}
        fontSize={20}
        py={16}
        speed={22}
      >
        SAUNA GAY PARIS &nbsp; ★ &nbsp; 3000 M² &nbsp; ★ &nbsp; OUVERT 7J/7 &nbsp; ★ &nbsp; EST. 2003 &nbsp; ★ &nbsp; ACID HOUSE &nbsp; ★ &nbsp; ZERO FILTER
      </Marquee>

      {/* Grille de stats */}
      <section
        style={{
          position: 'relative',
          background: V1.darkgray,
          borderTop: `3px solid ${V1.yellow}`,
          borderBottom: `3px solid ${V1.yellow}`,
          overflow: 'hidden',
        }}
      >
        <GrainOverlay opacity={0.07} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {FACTS.map((f, i) => (
            <div
              key={i}
              style={{
                padding: '48px 32px',
                borderRight: i < 3 ? `2px solid ${V1.yellow}22` : 'none',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div style={{ lineHeight: 0.85, marginBottom: 8 }}>
                <AcidText size={80} color={i % 2 === 0 ? V1.yellow : V1.red}>
                  {f.big}
                </AcidText>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
                  fontWeight: 900,
                  fontSize: 13,
                  letterSpacing: 3,
                  color: i % 2 === 0 ? V1.yellow : V1.red,
                  marginBottom: 4,
                }}
              >
                {f.unit}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: 11,
                  color: V1.cream,
                  opacity: 0.5,
                  letterSpacing: 1,
                }}
              >
                {f.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee rouge */}
      <Marquee
        bg={V1.red}
        color={V1.white}
        fontSize={18}
        py={14}
        speed={30}
      >
        LE PLUS GRAND SAUNA GAY DE PARIS &nbsp; ★ &nbsp; INTERDIT AUX -18 ANS &nbsp; ★ &nbsp; NO PHOTO · NO VIDEO &nbsp; ★ &nbsp; 62 BOULEVARD DE SÉBASTOPOL
      </Marquee>
    </>
  );
}
