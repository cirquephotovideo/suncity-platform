import { prisma } from '@/lib/prisma';
import { V1, AcidText, GrainOverlay, RaveTag, Sticker } from './V1Atoms';

export async function V1Zones({ locale }: { locale: string }) {
  const locations = await prisma.location.findMany({
    where: { active: true },
    include: { translations: { where: { locale: locale as any } } },
    orderBy: { orderIndex: 'asc' },
  }).catch(() => []);

  return (
    <section
      style={{
        position: 'relative',
        background: V1.black,
        padding: '100px 48px 80px',
        overflow: 'hidden',
      }}
    >
      <GrainOverlay opacity={0.08} />

      {/* Header section */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: 64 }}>
        <RaveTag color={V1.red}>§ 02 / LE LIEU</RaveTag>
        <div style={{ lineHeight: 0.85, marginBottom: 24 }}>
          <AcidText size={130} color={V1.white} style={{ display: 'block' }}>
            {locations.length} ZONES.
          </AcidText>
          <AcidText size={130} color={V1.yellow} skew={-4} style={{ display: 'block' }}>
            UN TERRAIN
          </AcidText>
          <AcidText size={130} color={V1.red} skew={-2} style={{ display: 'block' }}>
            DE JEU.
          </AcidText>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 16,
            color: V1.cream,
            opacity: 0.7,
            maxWidth: 560,
            lineHeight: 1.6,
          }}
        >
          De la piscine au cruising en passant par le sport.
          Tout est connecté. Tout est ouvert.
        </p>
      </div>

      {/* Grille zones */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 3,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {locations.map((loc, i) => {
          const tr = loc.translations[0];
          const num = String(i + 1).padStart(2, '0');
          const accent = i % 3 === 0 ? V1.yellow : i % 3 === 1 ? V1.red : V1.white;

          return (
            <div
              key={loc.id}
              style={{
                background: i % 2 === 0 ? V1.darkgray : '#0d0d0d',
                border: `1px solid ${V1.yellow}18`,
                position: 'relative',
                overflow: 'hidden',
                minHeight: 300,
              }}
            >
              {/* Cover image */}
              {loc.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={loc.coverImageUrl}
                  alt={tr?.title ?? loc.slug}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.25,
                  }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, ${accent}11 0%, transparent 70%)`,
                  }}
                />
              )}

              {/* Numéro déco */}
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -10,
                  fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
                  fontWeight: 900,
                  fontSize: 160,
                  lineHeight: 1,
                  color: accent,
                  opacity: 0.06,
                  letterSpacing: '-0.04em',
                  userSelect: 'none',
                }}
              >
                {num}
              </div>

              {/* Contenu */}
              <div style={{ position: 'relative', zIndex: 2, padding: 28 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-big-shoulders), sans-serif',
                    fontWeight: 900,
                    fontSize: 11,
                    letterSpacing: 3,
                    color: accent,
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  ZONE_{num} ━ {String(locations.length).padStart(2, '0')}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
                    fontWeight: 900,
                    fontSize: 36,
                    lineHeight: 0.9,
                    color: V1.white,
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    transform: 'scaleY(1.1)',
                    transformOrigin: 'bottom left',
                    marginBottom: 16,
                  }}
                >
                  {tr?.title ?? loc.slug}
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-body), sans-serif',
                    fontSize: 13,
                    color: V1.cream,
                    opacity: 0.65,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {tr?.summary ?? ''}
                </p>

                {/* Sticker numéro */}
                <div style={{ marginTop: 20 }}>
                  <Sticker bg={accent} color={V1.black} rotate={-1}>
                    {num} / {String(locations.length).padStart(2, '0')}
                  </Sticker>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
