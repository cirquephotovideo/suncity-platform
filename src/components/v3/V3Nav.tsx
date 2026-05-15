import { Link } from '@/i18n/routing';
import { V3, Pill } from './V3Atoms';

export function V3Nav() {
  return (
    <header style={{
      padding: '24px 56px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      position: 'relative', zIndex: 5,
    }}>
      <Link href="/v3" style={{ textDecoration: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 20px',
          borderRadius: 999,
          background: V3.white + '11',
          backdropFilter: 'blur(20px)',
          border: `1.5px solid ${V3.white}33`,
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${V3.cyan}, ${V3.magenta})`,
            boxShadow: `0 0 16px ${V3.magenta}AA`,
          }} />
          <span style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: 1, color: V3.white }}>
            SUNCITY ⚡
          </span>
        </div>
      </Link>
      <nav style={{
        display: 'flex', gap: 4, padding: 6,
        borderRadius: 999,
        background: V3.white + '0a',
        backdropFilter: 'blur(20px)',
        border: `1.5px solid ${V3.white}22`,
      }}>
        {[
          { label: 'AGENDA', href: '/agenda' },
          { label: 'ZONES', href: '/lieux' },
          { label: 'TARIFS', href: '/tarifs' },
          { label: 'INFOS', href: '/horaires-acces' },
        ].map(it => (
          <Link key={it.label} href={it.href as any} style={{
            padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            color: V3.white, letterSpacing: 0.5, textDecoration: 'none',
            fontFamily: 'var(--font-unbounded), sans-serif',
          }}>
            {it.label}
          </Link>
        ))}
      </nav>
      <Link href="/billetterie" style={{ textDecoration: 'none' }}>
        <Pill bg={V3.magenta}>ENTRER 18+ →</Pill>
      </Link>
    </header>
  );
}
