import { V2, MonoText } from './V2Atoms';

const MONO = "'JetBrains Mono', 'Space Mono', 'Courier New', monospace";

type SiteSettings = {
  siteName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
} | null;

const COL_1 = [
  { label: 'À propos', href: '/fr/a-propos' },
  { label: 'Zones & espaces', href: '#zones' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'Tarifs', href: '#pricing' },
];

const COL_2 = [
  { label: 'Boutique', href: '/fr/boutique' },
  { label: 'Galerie', href: '/fr/galerie' },
  { label: 'Actualités', href: '/fr/actualites' },
  { label: 'Partenaires', href: '/fr/partenaires' },
];

const COL_3 = [
  { label: 'Mentions légales', href: '/fr/mentions-legales' },
  { label: 'CGU', href: '/fr/cgu' },
  { label: 'RGPD', href: '/fr/rgpd' },
  { label: 'Contact', href: '/fr/contact' },
];

export default function V2Footer({ settings }: { settings: SiteSettings }) {
  const name = settings?.siteName ?? 'Sun City Paris';
  const address = settings?.address ?? '8 Rue des Lombards, 75004 Paris';
  const phone = settings?.phone ?? '+33 1 42 72 00 00';
  const email = settings?.email ?? 'hello@suncity-paris.fr';

  return (
    <footer
      id="footer"
      style={{
        background: V2.black,
        borderTop: `1px solid ${V2.green}`,
        padding: '64px 40px 32px',
        position: 'relative',
      }}
    >
      {/* Top status bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 48,
          paddingBottom: 24,
          borderBottom: `1px solid ${V2.green}22`,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            background: V2.green,
            boxShadow: `0 0 10px ${V2.green}`,
            animation: 'pulse 2s infinite',
            flexShrink: 0,
          }}
        />
        <MonoText size={12} weight={700} color={V2.green}>
          SUN_CITY :: SYSTEM_ONLINE
        </MonoText>
        <div style={{ flex: 1, height: 1, background: `${V2.green}22` }} />
        <MonoText size={9} color={V2.green} style={{ opacity: 0.35 }}>
          [[ 2026 · PARIS_FR ]]
        </MonoText>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 10px #00FF41; }
            50% { opacity: 0.4; box-shadow: 0 0 4px #00FF41; }
          }
        `}</style>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 48,
          }}
        >
          {/* Brand column */}
          <div>
            <MonoText size={20} weight={900} color={V2.green} style={{ display: 'block', marginBottom: 16, letterSpacing: '0.05em' }}>
              {name.toUpperCase().replace(' ', '_')}
            </MonoText>
            <MonoText size={9} color={V2.green} style={{ opacity: 0.5, display: 'block', marginBottom: 24, lineHeight: 1.7 }}>
              Le plus grand sauna gay de Paris.{'\n'}
              3 000 m² · 3 étages · Ouvert 7j/7.
            </MonoText>

            {/* Contact data */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <MonoText size={8} color={V2.green} style={{ opacity: 0.35, flexShrink: 0 }}>ADDR::</MonoText>
                <MonoText size={9} color={V2.green} style={{ opacity: 0.65 }}>{address}</MonoText>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <MonoText size={8} color={V2.green} style={{ opacity: 0.35, flexShrink: 0 }}>TEL::</MonoText>
                <a href={`tel:${phone.replace(/\s/g, '')}`} style={{ textDecoration: 'none' }}>
                  <MonoText size={9} color={V2.green} style={{ opacity: 0.65 }}>{phone}</MonoText>
                </a>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <MonoText size={8} color={V2.green} style={{ opacity: 0.35, flexShrink: 0 }}>MAIL:</MonoText>
                <a href={`mailto:${email}`} style={{ textDecoration: 'none' }}>
                  <MonoText size={9} color={V2.green} style={{ opacity: 0.65 }}>{email}</MonoText>
                </a>
              </div>
            </div>
          </div>

          {/* Nav columns */}
          {[
            { title: 'LE_SAUNA', links: COL_1 },
            { title: 'RESSOURCES', links: COL_2 },
            { title: 'LÉGAL', links: COL_3 },
          ].map((col) => (
            <div key={col.title}>
              <MonoText size={9} color={V2.green} style={{ opacity: 0.4, display: 'block', marginBottom: 20, letterSpacing: '0.2em' }}>
                // {col.title}
              </MonoText>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      color: V2.green,
                      textDecoration: 'none',
                      opacity: 0.6,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Social + copyright */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: `1px solid ${V2.green}22`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <MonoText size={8} color={V2.green} style={{ opacity: 0.3 }}>
            © 2026 SUN_CITY_PARIS — TOUS_DROITS_RÉSERVÉS — RÉSERVÉ_AUX_MAJEURS
          </MonoText>

          <div style={{ display: 'flex', gap: 16 }}>
            {settings?.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <MonoText size={9} color={V2.green} style={{ opacity: 0.5 }}>IG</MonoText>
              </a>
            )}
            {settings?.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <MonoText size={9} color={V2.green} style={{ opacity: 0.5 }}>FB</MonoText>
              </a>
            )}
            {settings?.twitterUrl && (
              <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <MonoText size={9} color={V2.green} style={{ opacity: 0.5 }}>TW</MonoText>
              </a>
            )}
          </div>

          <MonoText size={8} color={V2.green} style={{ opacity: 0.2 }}>
            BUILD::sun_city_os_v2.0.1 // next14+prisma5+ts
          </MonoText>
        </div>
      </div>
    </footer>
  );
}
