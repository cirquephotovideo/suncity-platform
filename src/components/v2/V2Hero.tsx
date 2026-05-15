import type { CSSProperties } from 'react';
import { V2, MonoText, SchematicBox, DataTag } from './V2Atoms';

const MONO = "'JetBrains Mono', 'Space Mono', 'Courier New', monospace";

const METRICS = [
  { label: 'SURFACE', value: '3000_M2' },
  { label: 'ETAGES', value: '03' },
  { label: 'ZONES', value: '05' },
  { label: 'OUVERTURE', value: '7J/7' },
];

export default function V2Hero({
  siteName,
  tagline,
}: {
  siteName?: string;
  tagline?: string;
}) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: V2.black,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '120px 40px 80px',
        overflow: 'hidden',
        paddingTop: 96,
      }}
    >
      {/* Grid overlay */}
      <GridOverlay />

      {/* System boot lines — top */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 40,
          right: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          opacity: 0.5,
        }}
      >
        <MonoText size={9} color={V2.green}>SYSTEM_BOOT :: SUN_CITY_OS v2.0.1</MonoText>
        <MonoText size={9} color={V2.green}>LOADING... VENUE_DATABASE :: OK</MonoText>
        <MonoText size={9} color={V2.green}>INIT BERGHAIN_PROTOCOL :: ACTIVE</MonoText>
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* Coord label */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 32, height: 1, background: V2.green, opacity: 0.6 }} />
          <MonoText size={9} color={V2.green} style={{ opacity: 0.5 }}>
            48.8566°N · 2.3522°E · PARIS_11E
          </MonoText>
        </div>

        {/* Big headline */}
        <h1
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(36px, 8vw, 96px)',
            fontWeight: 900,
            color: V2.green,
            letterSpacing: '-0.01em',
            lineHeight: 0.95,
            margin: 0,
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          {siteName ?? 'SUN CITY'}
        </h1>

        <h2
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(10px, 1.5vw, 14px)',
            fontWeight: 400,
            color: V2.green,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            margin: '0 0 48px',
            opacity: 0.6,
          }}
        >
          {tagline ?? 'LE PLUS GRAND SAUNA GAY DE PARIS'}
        </h2>

        {/* Metrics grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, auto)',
            gap: 0,
            width: 'fit-content',
            marginBottom: 64,
          }}
        >
          {METRICS.map((m, i) => (
            <SchematicBox
              key={m.label}
              label={m.label}
              style={{
                padding: '20px 32px',
                marginRight: i < METRICS.length - 1 ? -1 : 0,
              }}
            >
              <MonoText size={28} weight={700} color={V2.green}>
                {m.value}
              </MonoText>
            </SchematicBox>
          ))}
        </div>

        {/* CTA row */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a
            href="#pricing"
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: V2.black,
              background: V2.green,
              border: 'none',
              padding: '14px 32px',
              cursor: 'pointer',
              textDecoration: 'none',
              fontWeight: 700,
              display: 'inline-block',
            }}
          >
            ENTRER :: ACCÈS_TARIFS
          </a>
          <a
            href="#agenda"
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: V2.green,
              border: `1px solid ${V2.green}`,
              padding: '13px 32px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            AGENDA_SEMAINE
          </a>
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: `1px solid ${V2.green}22`,
          padding: '10px 40px',
          display: 'flex',
          gap: 40,
          alignItems: 'center',
          background: `${V2.black}ee`,
        }}
      >
        <DataTag label="STATUS" value="OPEN" />
        <DataTag label="HORAIRES" value="12H-03H" />
        <DataTag label="VEN+SAM" value="→06H" />
        <div style={{ flex: 1 }} />
        <MonoText size={9} color={V2.green} style={{ opacity: 0.3 }}>
          [[ ADULT_CONTENT :: VERIFIED_18+ ]]
        </MonoText>
      </div>
    </section>
  );
}

function GridOverlay() {
  const vLines = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const hLines = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {vLines.map((i) => (
        <div
          key={`v${i}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${(i / 12) * 100}%`,
            width: 1,
            background: V2.green,
            opacity: 0.05,
          }}
        />
      ))}
      {hLines.map((i) => (
        <div
          key={`h${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${(i / 9) * 100}%`,
            height: 1,
            background: V2.green,
            opacity: 0.05,
          }}
        />
      ))}
      {/* Crosshair center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 20,
          height: 20,
          transform: 'translate(-50%, -50%)',
          border: `1px solid ${V2.green}`,
          opacity: 0.15,
        }}
      />
    </div>
  );
}
