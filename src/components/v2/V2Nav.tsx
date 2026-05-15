import type { CSSProperties } from 'react';
import { V2, MonoText } from './V2Atoms';

const MONO = "'JetBrains Mono', 'Space Mono', 'Courier New', monospace";

const NAV_LINKS = [
  { label: 'ZONES', href: '#zones' },
  { label: 'AGENDA', href: '#agenda' },
  { label: 'TARIFS', href: '#pricing' },
  { label: 'ACCÈS', href: '#footer' },
];

export default function V2Nav({ locale }: { locale: string }) {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: V2.black,
        borderBottom: `1px solid ${V2.green}33`,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 0,
      }}
    >
      {/* Logo / ID */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
        <div
          style={{
            width: 8,
            height: 8,
            background: V2.green,
            boxShadow: `0 0 8px ${V2.green}`,
            flexShrink: 0,
          }}
        />
        <MonoText size={13} weight={700} color={V2.green}>
          SUN_CITY.PARIS
        </MonoText>
        <MonoText size={9} color={V2.green} style={{ opacity: 0.4 }}>
          // v2.0
        </MonoText>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: V2.green,
              textDecoration: 'none',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              opacity: 0.7,
              transition: 'opacity 0.15s',
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Locale indicator */}
      <div
        style={{
          marginLeft: 32,
          border: `1px solid ${V2.green}44`,
          padding: '3px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <MonoText size={9} color={V2.green} style={{ opacity: 0.6 }}>
          LOCALE:{locale.toUpperCase()}
        </MonoText>
      </div>
    </nav>
  );
}
