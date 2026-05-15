'use client';
import type { CSSProperties } from 'react';
import { V4, MonoLabel } from './V4Atoms';
import { Link } from '@/i18n/routing';

interface V4NavProps {
  locale: string;
  siteName?: string;
}

export default function V4Nav({ locale, siteName = 'Sun City' }: V4NavProps) {
  const links = [
    { href: '/v4#zones',   labelFr: 'Espaces',  labelEn: 'Spaces'   },
    { href: '/v4#agenda',  labelFr: 'Agenda',   labelEn: 'Agenda'   },
    { href: '/v4#tarifs',  labelFr: 'Tarifs',   labelEn: 'Pricing'  },
    { href: '/v4#acces',   labelFr: 'Accès',    labelEn: 'Access'   },
  ];

  const labelKey = locale === 'fr' ? 'labelFr' : 'labelEn';

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        background: `linear-gradient(to bottom, ${V4.night}f0 0%, transparent 100%)`,
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* Logo */}
      <Link href="/v4" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Croissant SVG mini */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M11 3 A9 9 0 1 0 11 19 A6.5 9 0 1 1 11 3"
              fill={V4.moon}
              opacity="0.9"
            />
          </svg>
          <span
            style={{
              fontFamily: "'Fraunces', 'Playfair Display', serif",
              fontVariationSettings: '"opsz" 144, "WONK" 1, "SOFT" 80',
              fontSize: 20,
              fontWeight: 300,
              color: V4.cream,
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            {siteName}
          </span>
        </div>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              textDecoration: 'none',
              color: `${V4.cream}bb`,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = V4.moon; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = `${V4.cream}bb`; }}
          >
            {l[labelKey]}
          </a>
        ))}

        {/* CTA */}
        <a
          href="/v4#tarifs"
          style={{
            textDecoration: 'none',
            background: V4.moon,
            color: V4.night,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            padding: '10px 20px',
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          {locale === 'fr' ? 'Réserver' : 'Book'}
        </a>
      </div>
    </nav>
  );
}
