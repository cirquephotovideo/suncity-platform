import { prisma } from '@/lib/prisma';
import { V1, AcidText, GrainOverlay, Sticker, Marquee } from './V1Atoms';

export async function V1Footer() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  const phone   = settings?.contactPhone ?? '01 40 09 26 09';
  const email   = settings?.contactEmail ?? 'info@suncityparis.com';
  const address = settings?.address ?? '62 boulevard de Sébastopol, 75003 Paris';

  let socialLinks: { instagram?: string; facebook?: string; twitter?: string } = {};
  if (settings?.socialJson) {
    try { socialLinks = JSON.parse(settings.socialJson as string); } catch {}
  }

  return (
    <footer
      style={{
        position: 'relative',
        background: V1.black,
        borderTop: `4px solid ${V1.yellow}`,
        overflow: 'hidden',
      }}
    >
      <GrainOverlay opacity={0.1} />

      {/* Grand titre SUNCITY */}
      <div
        style={{
          textAlign: 'center',
          padding: '80px 48px 40px',
          position: 'relative',
          zIndex: 2,
          borderBottom: `2px solid ${V1.yellow}22`,
        }}
      >
        <div style={{ lineHeight: 0.82 }}>
          <AcidText size={180} color={V1.yellow} style={{ display: 'block' }}>
            SUN
          </AcidText>
          <AcidText size={180} color={V1.white} skew={-2} style={{ display: 'block' }}>
            CITY
          </AcidText>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 18,
            color: V1.cream,
            opacity: 0.7,
            marginTop: 20,
          }}
        >
          On t'attend.
        </p>
        <div style={{ marginTop: 24 }}>
          <Sticker bg={V1.yellow} color={V1.black} rotate={-1}>
            +18 · NO PHOTO · NO VIDEO
          </Sticker>
        </div>
      </div>

      {/* Grid infos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 0,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Adresse */}
        <div
          style={{
            padding: '40px 48px',
            borderRight: `1px solid ${V1.yellow}22`,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-big-shoulders), sans-serif',
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: 3,
              color: V1.yellow,
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            ⊕ ON EST OÙ
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontWeight: 600,
              fontSize: 15,
              lineHeight: 1.6,
              color: V1.cream,
            }}
          >
            {address.split(',')[0]}<br />
            {address.split(',').slice(1).join(',').trim()}<br />
            <span style={{ opacity: 0.6, fontWeight: 400, fontSize: 13 }}>
              M° Étienne Marcel · Réaumur-Sébastopol
            </span>
          </div>
        </div>

        {/* Téléphone */}
        <div
          style={{
            padding: '40px 48px',
            borderRight: `1px solid ${V1.yellow}22`,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-big-shoulders), sans-serif',
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: 3,
              color: V1.yellow,
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            ⊕ APPELLE
          </div>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            style={{
              fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
              fontWeight: 900,
              fontSize: 32,
              lineHeight: 0.95,
              color: V1.white,
              textDecoration: 'none',
              display: 'block',
              transform: 'scaleY(1.2)',
              transformOrigin: 'bottom left',
            }}
          >
            {phone}
          </a>
          {email && (
            <a
              href={`mailto:${email}`}
              style={{
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: 13,
                color: V1.yellow,
                textDecoration: 'none',
                display: 'block',
                marginTop: 12,
                opacity: 0.8,
              }}
            >
              {email}
            </a>
          )}
        </div>

        {/* Horaires */}
        <div style={{ padding: '40px 48px' }}>
          <div
            style={{
              fontFamily: 'var(--font-big-shoulders), sans-serif',
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: 3,
              color: V1.yellow,
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            ⊕ HORAIRES
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 15,
              lineHeight: 1.7,
              color: V1.cream,
            }}
          >
            <span style={{ fontWeight: 700, color: V1.yellow, fontFamily: 'var(--font-big-shoulders), sans-serif', letterSpacing: 1 }}>DIM-JEU</span>
            <span style={{ opacity: 0.7 }}> · 12h → 2h</span>
            <br />
            <span style={{ fontWeight: 700, color: V1.red, fontFamily: 'var(--font-big-shoulders), sans-serif', letterSpacing: 1 }}>VEN-SAM</span>
            <span style={{ opacity: 0.7 }}> · 12h → 6h</span>
          </div>
          {/* Réseaux */}
          <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <span style={{
                  display: 'inline-block',
                  background: 'transparent',
                  border: `1.5px solid ${V1.yellow}66`,
                  color: V1.yellow,
                  fontFamily: 'var(--font-big-shoulders), sans-serif',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 2,
                  padding: '6px 14px',
                  textTransform: 'uppercase',
                }}>INSTA</span>
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <span style={{
                  display: 'inline-block',
                  background: 'transparent',
                  border: `1.5px solid ${V1.yellow}66`,
                  color: V1.yellow,
                  fontFamily: 'var(--font-big-shoulders), sans-serif',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 2,
                  padding: '6px 14px',
                  textTransform: 'uppercase',
                }}>FB</span>
              </a>
            )}
            {!socialLinks.instagram && !socialLinks.facebook && (
              <>
                {['INSTA', 'FB', 'TWITTER'].map(s => (
                  <span key={s} style={{
                    display: 'inline-block',
                    background: 'transparent',
                    border: `1.5px solid ${V1.yellow}44`,
                    color: V1.yellow,
                    fontFamily: 'var(--font-big-shoulders), sans-serif',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: 2,
                    padding: '6px 14px',
                    textTransform: 'uppercase',
                    opacity: 0.6,
                  }}>{s}</span>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mentions légales */}
      <Marquee
        bg={V1.black}
        color={V1.yellow}
        fontSize={12}
        py={10}
        speed={50}
        style={{ borderTop: `1px solid ${V1.yellow}33`, opacity: 0.5 }}
      >
        © SUNCITY · SARL GYM SEBASTOPOL · RCS 45274626600025 · 62 BD DE SÉBASTOPOL 75003 PARIS · +18 · NO PHOTO · NO VIDEO
      </Marquee>
    </footer>
  );
}
