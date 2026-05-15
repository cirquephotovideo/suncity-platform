import { V4, EditorialText, MonoLabel, MoonPattern } from './V4Atoms';
import { Link } from '@/i18n/routing';

interface SiteSettingsData {
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  socialJson?: unknown;
}

interface V4FooterProps {
  locale: string;
  settings?: SiteSettingsData | null;
}

export default function V4Footer({ locale, settings }: V4FooterProps) {
  const isFr = locale === 'fr';

  const social = (settings?.socialJson as Record<string, string> | null) ?? {};

  const cols = [
    {
      title: isFr ? 'Le sauna' : 'The sauna',
      links: [
        { label: isFr ? 'Nos espaces' : 'Spaces', href: '/v4#zones' },
        { label: isFr ? 'Tarifs & entrées' : 'Pricing', href: '/v4#tarifs' },
        { label: isFr ? 'Agenda' : 'Agenda', href: '/v4#agenda' },
        { label: isFr ? 'Accès & horaires' : 'Access & hours', href: '/v4#acces' },
      ],
    },
    {
      title: isFr ? 'Infos pratiques' : 'Practical info',
      links: [
        { label: isFr ? 'Règlement intérieur' : 'House rules', href: '/mentions-legales' },
        { label: 'FAQ', href: '/contact' },
        { label: isFr ? 'Nous contacter' : 'Contact us', href: '/contact' },
        { label: 'Newsletter', href: '/newsletter' },
      ],
    },
    {
      title: isFr ? 'Mon compte' : 'My account',
      links: [
        { label: isFr ? 'Se connecter' : 'Log in', href: '/auth/signin' },
        { label: isFr ? 'Créer un compte' : 'Create account', href: '/auth/signup' },
        { label: isFr ? 'Mes commandes' : 'My orders', href: '/mon-compte/commandes' },
        { label: isFr ? 'Boutique' : 'Shop', href: '/boutique' },
      ],
    },
  ];

  return (
    <footer
      style={{
        background: '#080D1A',
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 60px 48px',
      }}
    >
      <MoonPattern size={300} color={V4.moon} opacity={0.04} id="footer-moon" />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 60,
            marginBottom: 80,
            alignItems: 'flex-start',
          }}
        >
          {/* Brand */}
          <div>
            <EditorialText
              size={56}
              color={V4.cream}
              style={{ display: 'block', opacity: 0.9 }}
            >
              Sun City
            </EditorialText>
            <EditorialText
              size={56}
              color={V4.moon}
              style={{
                display: 'block',
                fontStyle: 'italic',
                fontVariationSettings: '"opsz" 144, "WONK" 1, "SOFT" 100',
                opacity: 0.7,
              }}
            >
              Paris.
            </EditorialText>
            {settings?.address && (
              <MonoLabel
                size={10}
                color={`${V4.cream}40`}
                style={{ display: 'block', marginTop: 24, maxWidth: 280, lineHeight: '1.8' }}
              >
                {settings.address}
              </MonoLabel>
            )}
            {settings?.contactPhone && (
              <MonoLabel size={10} color={`${V4.cream}30`} style={{ display: 'block', marginTop: 8 }}>
                {settings.contactPhone}
              </MonoLabel>
            )}
          </div>

          {/* Croissant déco */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.15 }}>
            <path
              d="M40 8 A32 32 0 1 0 40 72 A23 32 0 1 1 40 8"
              fill={V4.moon}
            />
          </svg>
        </div>

        {/* Colonnes liens */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 40,
            paddingBottom: 60,
            borderBottom: `1px solid ${V4.moon}10`,
            marginBottom: 40,
          }}
        >
          {cols.map((col) => (
            <div key={col.title}>
              <MonoLabel
                size={9}
                color={`${V4.moon}50`}
                style={{ display: 'block', marginBottom: 20 }}
              >
                {col.title}
              </MonoLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href as any}
                    style={{
                      textDecoration: 'none',
                      fontFamily: "'Fraunces', 'Playfair Display', serif",
                      fontVariationSettings: '"opsz" 72, "WONK" 0, "SOFT" 40',
                      fontSize: 16,
                      fontWeight: 300,
                      color: `${V4.cream}60`,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <MonoLabel size={9} color={`${V4.cream}25`}>
            © {new Date().getFullYear()} Sun City Paris · {isFr ? 'Tous droits réservés' : 'All rights reserved'}
          </MonoLabel>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/mentions-legales" style={{ textDecoration: 'none' }}>
              <MonoLabel size={9} color={`${V4.cream}25`}>
                {isFr ? 'Mentions légales' : 'Legal'}
              </MonoLabel>
            </Link>
            <Link href="/confidentialite" style={{ textDecoration: 'none' }}>
              <MonoLabel size={9} color={`${V4.cream}25`}>
                {isFr ? 'Confidentialité' : 'Privacy'}
              </MonoLabel>
            </Link>
          </div>
          {/* Locale switcher */}
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/fr/v4" style={{ textDecoration: 'none' }}>
              <MonoLabel size={9} color={locale === 'fr' ? V4.moon : `${V4.cream}25`}>FR</MonoLabel>
            </a>
            <MonoLabel size={9} color={`${V4.cream}15`}>/</MonoLabel>
            <a href="/en/v4" style={{ textDecoration: 'none' }}>
              <MonoLabel size={9} color={locale === 'en' ? V4.moon : `${V4.cream}25`}>EN</MonoLabel>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
