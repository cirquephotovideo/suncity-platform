import { prisma } from '@/lib/prisma';
import { V1, AcidText, GrainOverlay, RaveTag, Sticker, Marquee } from './V1Atoms';

const INCLUDES = [
  'Entrée au sauna complet',
  '2 boissons offertes',
  '2 serviettes (+1€ la suivante)',
  'Préservatifs à volonté',
];

function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(0)}€`;
}

export async function V1Pricing({ locale }: { locale: string }) {
  const tariffs = await prisma.tariff.findMany({
    where: { active: true },
    include: { translations: { where: { locale: locale as any } } },
    orderBy: { orderIndex: 'asc' },
  }).catch(() => []);

  const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
  const weekends = ['FRIDAY', 'SATURDAY', 'SUNDAY'];

  const wdayFull    = tariffs.find(t => t.daysApplicable.some(d => weekdays.includes(d)) && !t.conditionLabel?.includes('26'));
  const wdayYoung   = tariffs.find(t => t.daysApplicable.some(d => weekdays.includes(d)) && t.conditionLabel?.includes('26'));
  const weekendFull = tariffs.find(t => t.daysApplicable.some(d => weekends.includes(d)) && !t.conditionLabel?.includes('26') && !t.conditionLabel?.includes('après'));
  const weekendYoung= tariffs.find(t => t.daysApplicable.some(d => weekends.includes(d)) && t.conditionLabel?.includes('26'));
  const weekendLate = tariffs.find(t => t.conditionLabel?.includes('après'));
  const tueSpecial  = tariffs.find(t => t.daysApplicable.length === 1 && t.daysApplicable[0] === 'TUESDAY');

  return (
    <section
      style={{
        position: 'relative',
        background: V1.black,
        borderTop: `3px solid ${V1.yellow}`,
        overflow: 'hidden',
      }}
    >
      <GrainOverlay opacity={0.09} />

      {/* Header */}
      <div style={{ padding: '80px 48px 56px', position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <RaveTag color={V1.yellow}>§ 04 / TARIFS</RaveTag>
        <div style={{ lineHeight: 0.85 }}>
          <AcidText size={130} color={V1.yellow} style={{ display: 'block' }}>
            COMBIEN
          </AcidText>
          <AcidText size={130} color={V1.white} skew={-3} style={{ display: 'block' }}>
            ÇA COÛTE.
          </AcidText>
        </div>
      </div>

      {/* Grille tarifs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 3,
          padding: '0 48px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Semaine */}
        <div
          style={{
            background: V1.darkgray,
            border: `2px solid ${V1.yellow}`,
            boxShadow: `6px 6px 0 ${V1.yellow}44`,
            padding: 40,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-big-shoulders), sans-serif',
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: 3,
              color: V1.yellow,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            ⊕ LUNDI → JEUDI
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <div style={{ lineHeight: 0.85, marginBottom: 4 }}>
                <AcidText size={90} color={V1.yellow}>{formatPrice(wdayFull?.priceCents ?? 2200)}</AcidText>
              </div>
              <div style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 12, color: V1.cream, opacity: 0.5 }}>plein</div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
                  fontWeight: 900,
                  fontSize: 64,
                  lineHeight: 0.85,
                  color: V1.cream,
                  transform: 'scaleY(1.2)',
                  transformOrigin: 'bottom left',
                  display: 'inline-block',
                  marginBottom: 4,
                }}
              >
                {formatPrice(wdayYoung?.priceCents ?? 1400)}
              </div>
              <div style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 12, color: V1.yellow, fontWeight: 700 }}>-26 ans</div>
            </div>
          </div>
          {tueSpecial && (
            <div
              style={{
                background: V1.yellow,
                color: V1.black,
                padding: '14px 20px',
                fontFamily: 'var(--font-big-shoulders), sans-serif',
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                border: `2px solid ${V1.black}`,
                boxShadow: `4px 4px 0 ${V1.black}`,
              }}
            >
              ★ MARDI · {formatPrice(tueSpecial.priceCents)} SI T'AS -26
            </div>
          )}
        </div>

        {/* Weekend */}
        <div
          style={{
            background: V1.darkgray,
            border: `2px solid ${V1.red}`,
            boxShadow: `6px 6px 0 ${V1.red}44`,
            padding: 40,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-big-shoulders), sans-serif',
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: 3,
              color: V1.red,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            ⊕ VENDREDI → DIMANCHE
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <div style={{ lineHeight: 0.85, marginBottom: 4 }}>
                <AcidText size={90} color={V1.red}>{formatPrice(weekendFull?.priceCents ?? 2500)}</AcidText>
              </div>
              <div style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 12, color: V1.cream, opacity: 0.5 }}>plein</div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
                  fontWeight: 900,
                  fontSize: 64,
                  lineHeight: 0.85,
                  color: V1.cream,
                  transform: 'scaleY(1.2)',
                  transformOrigin: 'bottom left',
                  display: 'inline-block',
                  marginBottom: 4,
                }}
              >
                {formatPrice(weekendYoung?.priceCents ?? 1700)}
              </div>
              <div style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 12, color: V1.red, fontWeight: 700 }}>-26 ans</div>
            </div>
          </div>
          {weekendLate && (
            <div
              style={{
                background: 'transparent',
                color: V1.red,
                padding: '14px 20px',
                fontFamily: 'var(--font-big-shoulders), sans-serif',
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                border: `2px solid ${V1.red}`,
              }}
            >
              ★ {formatPrice(weekendLate.priceCents)} APRÈS 3H VEN-SAM
            </div>
          )}
        </div>
      </div>

      {/* Inclus */}
      <div
        style={{
          margin: '24px 48px 0',
          background: V1.darkgray,
          border: `2px solid ${V1.yellow}33`,
          padding: '40px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-big-shoulders), sans-serif',
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: 3,
            color: V1.yellow,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          ⊕ TOUT EST INCLUS
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {INCLUDES.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span
                style={{
                  flex: '0 0 28px',
                  height: 28,
                  background: i % 2 === 0 ? V1.yellow : V1.red,
                  color: V1.black,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-big-shoulders), sans-serif',
                  fontWeight: 900,
                  fontSize: 14,
                  border: `2px solid ${V1.black}`,
                }}
              >
                ★
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: 15,
                  fontWeight: 600,
                  color: V1.cream,
                  lineHeight: 1.3,
                  paddingTop: 4,
                }}
              >
                {it}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 12,
            color: V1.cream,
            opacity: 0.4,
          }}
        >
          Tarif jeune sur présentation d'une pièce d'identité. -26 ans uniquement.
        </div>
      </div>

      {/* Marquee fin de section */}
      <Marquee
        bg={V1.yellow}
        color={V1.black}
        fontSize={17}
        py={14}
        speed={28}
        style={{ marginTop: 40 }}
      >
        ENTRÉE + 2 BOISSONS + 2 SERVIETTES + PRÉSERVATIFS INCLUS &nbsp; ★ &nbsp; CARTE BLEUE ACCEPTÉE
      </Marquee>
    </section>
  );
}
