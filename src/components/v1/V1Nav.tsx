import { Link } from '@/i18n/routing';
import { V1, Sticker } from './V1Atoms';

export function V1Nav() {
  return (
    <header
      style={{
        padding: '20px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        borderBottom: `3px solid ${V1.yellow}`,
        background: V1.black,
      }}
    >
      {/* Logo */}
      <Link href="/v1" style={{ textDecoration: 'none' }}>
        <div
          style={{
            fontFamily: 'var(--font-big-shoulders), "Impact", sans-serif',
            fontWeight: 900,
            fontSize: 28,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: V1.yellow,
            lineHeight: 1,
          }}
        >
          SUN
          <span
            style={{
              color: V1.red,
              display: 'inline-block',
              transform: 'skewX(-5deg)',
              marginLeft: 4,
            }}
          >
            CITY
          </span>
        </div>
        <div
          style={{
            fontSize: 9,
            letterSpacing: 4,
            color: V1.cream,
            opacity: 0.6,
            fontFamily: 'var(--font-big-shoulders), sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          PARIS · EST. 2003
        </div>
      </Link>

      {/* Nav links */}
      <nav
        style={{
          display: 'flex',
          gap: 32,
          alignItems: 'center',
        }}
      >
        {[
          { label: 'AGENDA', href: '/agenda' as const },
          { label: 'ZONES', href: '/lieux' as const },
          { label: 'TARIFS', href: '/tarifs' as const },
          { label: 'INFOS', href: '/horaires-acces' as const },
        ].map((it) => (
          <Link
            key={it.label}
            href={it.href}
            style={{
              color: V1.cream,
              fontFamily: 'var(--font-big-shoulders), sans-serif',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            {it.label}
          </Link>
        ))}
      </nav>

      {/* CTA */}
      <Link href="/billetterie" style={{ textDecoration: 'none' }}>
        <Sticker bg={V1.yellow} color={V1.black} rotate={-1}>
          ENTRER 18+ →
        </Sticker>
      </Link>
    </header>
  );
}
