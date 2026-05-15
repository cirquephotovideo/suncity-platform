import { prisma } from '@/lib/prisma';
import { V1, AcidText, GrainOverlay, RaveTag, Sticker, Marquee } from './V1Atoms';

const DAY_LABEL: Record<string, string> = {
  MONDAY: 'LUN', TUESDAY: 'MAR', WEDNESDAY: 'MER', THURSDAY: 'JEU',
  FRIDAY: 'VEN', SATURDAY: 'SAM', SUNDAY: 'DIM',
};

const DAY_FULL: Record<string, string> = {
  MONDAY: 'LUNDI', TUESDAY: 'MARDI', WEDNESDAY: 'MERCREDI', THURSDAY: 'JEUDI',
  FRIDAY: 'VENDREDI', SATURDAY: 'SAMEDI', SUNDAY: 'DIMANCHE',
};

const WOM_LABEL: Record<string, string> = {
  ALL:  'Toutes les semaines',
  ODD:  '1ᵉʳ + 3ᵉ du mois',
  EVEN: '2ᵉ + 4ᵉ du mois',
  W1:   '1ᵉʳ du mois',
  W2:   '2ᵉ du mois',
  W3:   '3ᵉ du mois',
  W4:   '4ᵉ du mois',
  W5:   '5ᵉ du mois',
};

export async function V1Agenda({ locale }: { locale: string }) {
  const events = await prisma.recurringEvent.findMany({
    where: { active: true },
    include: { translations: { where: { locale: locale as any } } },
    orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
  }).catch(() => []);

  const today = new Date();
  const todayEnum = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][today.getDay()];
  const highlighted = events.find(e => e.dayOfWeek === todayEnum) ?? events[0];
  const highlightedTr = highlighted?.translations[0];

  return (
    <section
      style={{
        position: 'relative',
        background: V1.darkgray,
        borderTop: `3px solid ${V1.yellow}`,
        overflow: 'hidden',
      }}
    >
      <GrainOverlay opacity={0.08} />

      {/* Header */}
      <div
        style={{
          padding: '80px 48px 48px',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 32,
        }}
      >
        <div>
          <RaveTag color={V1.yellow}>§ 03 / AGENDA</RaveTag>
          <div style={{ lineHeight: 0.85 }}>
            <AcidText size={120} color={V1.white} style={{ display: 'block' }}>
              T'AS QUOI
            </AcidText>
            <AcidText size={120} color={V1.yellow} skew={-3} style={{ display: 'block' }}>
              CE SOIR ?
            </AcidText>
          </div>
        </div>

        {/* Card "En ce moment" */}
        {highlighted && highlightedTr && (
          <div
            style={{
              background: V1.yellow,
              color: V1.black,
              padding: '28px 32px',
              border: `3px solid ${V1.black}`,
              boxShadow: `6px 6px 0 ${V1.black}`,
              maxWidth: 300,
              position: 'relative',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-big-shoulders), sans-serif',
                fontWeight: 900,
                fontSize: 10,
                letterSpacing: 3,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              EN CE MOMENT
            </div>
            <div
              style={{
                fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
                fontWeight: 900,
                fontSize: 28,
                lineHeight: 0.9,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                marginBottom: 10,
              }}
            >
              {highlightedTr.title}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: 13,
                lineHeight: 1.4,
                opacity: 0.7,
              }}
            >
              {highlightedTr.summary ?? ''}
            </div>
            <div
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                background: V1.red,
                color: V1.white,
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-big-shoulders), sans-serif',
                fontWeight: 900,
                fontSize: 9,
                letterSpacing: 1,
                textAlign: 'center',
                border: `2px solid ${V1.black}`,
              }}
            >
              LIVE NOW
            </div>
          </div>
        )}
      </div>

      {/* Marquee intermédiaire */}
      <Marquee bg={V1.black} color={V1.yellow} fontSize={15} py={10} speed={35}
        style={{ borderTop: `1px solid ${V1.yellow}33`, borderBottom: `1px solid ${V1.yellow}33` }}
      >
        AGENDA RÉCURRENT &nbsp; ★ &nbsp; SOIRÉES THÉMATIQUES &nbsp; ★ &nbsp; DARKROOM &nbsp; ★ &nbsp; CRUISING &nbsp; ★ &nbsp; PISCINE &nbsp; ★ &nbsp; JACUZZI
      </Marquee>

      {/* Grille events */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 0,
          borderTop: `2px solid ${V1.yellow}22`,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {events.map((e, i) => {
          const tr = e.translations[0];
          if (!tr) return null;
          const accent = i % 3 === 0 ? V1.yellow : i % 3 === 1 ? V1.red : V1.cream;
          const bgCard = i % 2 === 0 ? '#0a0a0a' : '#111111';
          const tag = WOM_LABEL[e.weekOfMonth] ?? 'Toutes les semaines';

          return (
            <div
              key={e.id}
              style={{
                background: bgCard,
                borderRight: `1px solid ${V1.yellow}18`,
                borderBottom: `1px solid ${V1.yellow}18`,
                padding: '32px 28px',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Jour en grand */}
              <div
                style={{
                  fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
                  fontWeight: 900,
                  fontSize: 72,
                  lineHeight: 0.85,
                  color: accent,
                  letterSpacing: '-0.04em',
                  transform: 'scaleY(1.3)',
                  transformOrigin: 'bottom left',
                  marginBottom: 20,
                  opacity: 0.9,
                }}
              >
                {DAY_LABEL[e.dayOfWeek] ?? e.dayOfWeek.slice(0, 3)}
              </div>

              {/* Info */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
                    fontWeight: 900,
                    fontSize: 20,
                    lineHeight: 0.95,
                    color: V1.white,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    marginBottom: 8,
                  }}
                >
                  {tr.title}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-big-shoulders), sans-serif',
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: 2,
                    color: accent,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  → {tag}
                </div>
                {(e.startTime || e.priceLabel) && (
                  <div
                    style={{
                      fontFamily: 'var(--font-body), sans-serif',
                      fontSize: 12,
                      color: V1.cream,
                      opacity: 0.5,
                    }}
                  >
                    {e.startTime && `${e.startTime}${e.endTime ? ' → ' + e.endTime : ''}`}
                    {e.priceLabel && ` · ${e.priceLabel}`}
                  </div>
                )}
                {tr.summary && (
                  <div
                    style={{
                      fontFamily: 'var(--font-body), sans-serif',
                      fontSize: 12,
                      color: V1.cream,
                      opacity: 0.45,
                      lineHeight: 1.4,
                      marginTop: 6,
                    }}
                  >
                    {tr.summary}
                  </div>
                )}
              </div>

              {/* Accent corner */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 40,
                  height: 40,
                  background: accent,
                  opacity: 0.15,
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
