import { V2, MonoText, SchematicBox, SectionHeader } from './V2Atoms';

const MONO = "'JetBrains Mono', 'Space Mono', 'Courier New', monospace";

type ZoneData = {
  id: string;
  slug: string;
  iconKey?: string;
  coverImageUrl?: string | null;
  translations: { title: string; summary?: string | null; contentMd?: string | null }[];
};

// Zone blueprints — SVG schémas inline par zone
const ZONE_SVGS: Record<string, React.ReactNode> = {
  sauna: (
    <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect x="4" y="4" width="112" height="72" fill="none" stroke="#00FF41" strokeWidth="0.5" opacity="0.3" />
      {/* Bancs */}
      <rect x="12" y="12" width="96" height="14" fill="none" stroke="#00FF41" strokeWidth="1" opacity="0.7" />
      <rect x="12" y="32" width="96" height="10" fill="none" stroke="#00FF41" strokeWidth="1" opacity="0.7" />
      {/* Poêle */}
      <circle cx="60" cy="60" r="10" fill="none" stroke="#00FF41" strokeWidth="1" opacity="0.8" />
      <circle cx="60" cy="60" r="6" fill="#00FF41" opacity="0.15" />
      {/* Chaleur lignes */}
      <path d="M52 52 Q55 46 58 52" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.5" />
      <path d="M60 50 Q63 44 66 50" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.5" />
      <path d="M68 52 Q71 46 74 52" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.5" />
      {/* labels */}
      <text x="60" y="8" textAnchor="middle" fill="#00FF41" fontSize="4" fontFamily="monospace" opacity="0.6">SAUNA_FINLANDAIS</text>
      <text x="60" y="62" textAnchor="middle" fill="#00FF41" fontSize="3.5" fontFamily="monospace" opacity="0.6">POÊLE_∿90°C</text>
    </svg>
  ),
  piscine: (
    <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect x="4" y="4" width="112" height="72" fill="none" stroke="#00FF41" strokeWidth="0.5" opacity="0.3" />
      {/* Bassin */}
      <rect x="12" y="20" width="96" height="48" rx="4" fill="#00FF41" fillOpacity="0.04" stroke="#00FF41" strokeWidth="1" opacity="0.7" />
      {/* Vagues */}
      <path d="M18 36 Q30 30 42 36 Q54 42 66 36 Q78 30 90 36 Q102 42 108 36" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.4" />
      <path d="M18 46 Q30 40 42 46 Q54 52 66 46 Q78 40 90 46 Q102 52 108 46" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.3" />
      <path d="M18 56 Q30 50 42 56 Q54 62 66 56 Q78 50 90 56 Q102 62 108 56" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.2" />
      {/* Échelle */}
      <line x1="100" y1="20" x2="100" y2="68" stroke="#00FF41" strokeWidth="1" opacity="0.6" />
      <line x1="95" y1="28" x2="105" y2="28" stroke="#00FF41" strokeWidth="0.8" opacity="0.6" />
      <line x1="95" y1="36" x2="105" y2="36" stroke="#00FF41" strokeWidth="0.8" opacity="0.6" />
      <text x="60" y="14" textAnchor="middle" fill="#00FF41" fontSize="4" fontFamily="monospace" opacity="0.6">PISCINE_CHAUFFÉE</text>
      <text x="60" y="76" textAnchor="middle" fill="#00FF41" fontSize="3.5" fontFamily="monospace" opacity="0.4">∿32°C · 10M×5M</text>
    </svg>
  ),
  sport: (
    <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect x="4" y="4" width="112" height="72" fill="none" stroke="#00FF41" strokeWidth="0.5" opacity="0.3" />
      {/* Haltères */}
      <rect x="20" y="34" width="36" height="12" rx="1" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.6" />
      <rect x="14" y="30" width="8" height="20" rx="1" fill="none" stroke="#00FF41" strokeWidth="1" opacity="0.8" />
      <rect x="56" y="30" width="8" height="20" rx="1" fill="none" stroke="#00FF41" strokeWidth="1" opacity="0.8" />
      {/* Appareil cardio */}
      <rect x="78" y="20" width="32" height="48" rx="2" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.5" />
      <line x1="82" y1="32" x2="106" y2="32" stroke="#00FF41" strokeWidth="0.5" opacity="0.4" />
      <line x1="82" y1="40" x2="106" y2="40" stroke="#00FF41" strokeWidth="0.5" opacity="0.4" />
      <line x1="82" y1="48" x2="106" y2="48" stroke="#00FF41" strokeWidth="0.5" opacity="0.4" />
      <text x="60" y="10" textAnchor="middle" fill="#00FF41" fontSize="4" fontFamily="monospace" opacity="0.6">SALLE_MUSCULATION</text>
      <text x="40" y="77" textAnchor="middle" fill="#00FF41" fontSize="3" fontFamily="monospace" opacity="0.4">FREE_WEIGHTS</text>
      <text x="94" y="77" textAnchor="middle" fill="#00FF41" fontSize="3" fontFamily="monospace" opacity="0.4">CARDIO</text>
    </svg>
  ),
  cruising: (
    <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect x="4" y="4" width="112" height="72" fill="none" stroke="#00FF41" strokeWidth="0.5" opacity="0.3" />
      {/* Labyrinthe schématique */}
      <rect x="10" y="10" width="100" height="60" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.4" />
      <line x1="30" y1="10" x2="30" y2="50" stroke="#00FF41" strokeWidth="1" opacity="0.6" />
      <line x1="50" y1="30" x2="50" y2="70" stroke="#00FF41" strokeWidth="1" opacity="0.6" />
      <line x1="70" y1="10" x2="70" y2="50" stroke="#00FF41" strokeWidth="1" opacity="0.6" />
      <line x1="90" y1="30" x2="90" y2="70" stroke="#00FF41" strokeWidth="1" opacity="0.6" />
      {/* Cabines */}
      <rect x="12" y="52" width="16" height="16" fill="#00FF41" fillOpacity="0.08" stroke="#00FF41" strokeWidth="0.8" opacity="0.7" />
      <rect x="52" y="12" width="16" height="16" fill="#00FF41" fillOpacity="0.08" stroke="#00FF41" strokeWidth="0.8" opacity="0.7" />
      <rect x="72" y="52" width="16" height="16" fill="#00FF41" fillOpacity="0.08" stroke="#00FF41" strokeWidth="0.8" opacity="0.7" />
      {/* Flèches navigation */}
      <path d="M37 40 L43 40 M41 37 L43 40 L41 43" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.5" />
      <path d="M57 60 L63 60 M61 57 L63 60 L61 63" fill="none" stroke="#00FF41" strokeWidth="0.8" opacity="0.5" />
      <text x="60" y="8" textAnchor="middle" fill="#00FF41" fontSize="3.5" fontFamily="monospace" opacity="0.6">ZONE_CRUISING</text>
      <text x="60" y="77" textAnchor="middle" fill="#00FF41" fontSize="3" fontFamily="monospace" opacity="0.4">DARK_MAZE · CABINES</text>
    </svg>
  ),
  vestiaires: (
    <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect x="4" y="4" width="112" height="72" fill="none" stroke="#00FF41" strokeWidth="0.5" opacity="0.3" />
      {/* Casiers grid */}
      {[0,1,2,3].map(row =>
        [0,1,2,3,4,5].map(col => (
          <rect
            key={`${row}-${col}`}
            x={12 + col * 17}
            y={14 + row * 14}
            width={15}
            height={12}
            fill="none"
            stroke="#00FF41"
            strokeWidth="0.7"
            opacity={0.5 + (row + col) * 0.03}
          />
        ))
      )}
      {/* Serrures */}
      {[0,1,2,3,4,5].map(col => (
        <circle key={col} cx={19 + col * 17} cy={24} r={1.5} fill="none" stroke="#00FF41" strokeWidth="0.7" opacity="0.8" />
      ))}
      <text x="60" y="10" textAnchor="middle" fill="#00FF41" fontSize="4" fontFamily="monospace" opacity="0.6">VESTIAIRES</text>
      <text x="60" y="76" textAnchor="middle" fill="#00FF41" fontSize="3" fontFamily="monospace" opacity="0.4">CASIERS_SÉCURISÉS · DOUCHES</text>
    </svg>
  ),
};

// Fallback blueprint générique
function DefaultSVG({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect x="4" y="4" width="112" height="72" fill="none" stroke="#00FF41" strokeWidth="0.5" opacity="0.3" />
      <text x="60" y="44" textAnchor="middle" fill="#00FF41" fontSize="8" fontFamily="monospace" opacity="0.4">
        {id.toUpperCase()}
      </text>
    </svg>
  );
}

function ZoneCard({ zone, index }: { zone: ZoneData; index: number }) {
  const t = zone.translations[0];
  const title = t?.title ?? zone.slug.toUpperCase();
  const summary = t?.summary ?? '';
  const svg = ZONE_SVGS[zone.slug.toLowerCase()] ?? <DefaultSVG id={zone.slug} />;

  return (
    <SchematicBox
      label={`ZONE_${String(index + 1).padStart(2, '0')}`}
      style={{
        background: V2.gray,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Blueprint diagram */}
      <div
        style={{
          height: 160,
          background: '#000',
          borderBottom: `1px solid ${V2.green}22`,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {svg}
      </div>

      {/* Info */}
      <div style={{ padding: '20px 24px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 4, height: 4, background: V2.green }} />
          <MonoText size={14} weight={700} color={V2.green}>
            {title}
          </MonoText>
        </div>
        {summary && (
          <MonoText size={10} color={V2.green} style={{ opacity: 0.65, lineHeight: 1.6, display: 'block' }}>
            {summary}
          </MonoText>
        )}
      </div>

      {/* Footer tag */}
      <div
        style={{
          borderTop: `1px solid ${V2.green}22`,
          padding: '8px 24px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <MonoText size={8} color={V2.green} style={{ opacity: 0.4 }}>
          ID::{zone.id.slice(0, 8)}
        </MonoText>
        <MonoText size={8} color={V2.green} style={{ opacity: 0.4 }}>
          {zone.slug.toUpperCase()}
        </MonoText>
      </div>
    </SchematicBox>
  );
}

export default function V2Zones({ zones }: { zones: ZoneData[] }) {
  // Fallback zones si Prisma vide
  const displayZones: ZoneData[] =
    zones.length > 0
      ? zones
      : [
          { id: 'fallback-1', slug: 'sauna', iconKey: null as any, coverImageUrl: null, translations: [{ title: 'Sauna Finlandais', summary: 'Sauna finlandais 90°C. Infusions d\'huiles essentielles le week-end.' }] },
          { id: 'fallback-2', slug: 'piscine', iconKey: null as any, coverImageUrl: null, translations: [{ title: 'Piscine & Jacuzzi', summary: 'Piscine chauffée 32°C, jacuzzi balnéo 8 places, hammam.' }] },
          { id: 'fallback-3', slug: 'sport', iconKey: null as any, coverImageUrl: null, translations: [{ title: 'Salle de Sport', summary: 'Musculation, cardio, free weights. Ouvert en continu.' }] },
          { id: 'fallback-4', slug: 'cruising', iconKey: null as any, coverImageUrl: null, translations: [{ title: 'Zone Cruising', summary: 'Dark maze, cabines privées, espaces thématiques.' }] },
          { id: 'fallback-5', slug: 'vestiaires', iconKey: null as any, coverImageUrl: null, translations: [{ title: 'Vestiaires', summary: 'Casiers sécurisés, douches, serviettes incluses.' }] },
        ];

  return (
    <section
      id="zones"
      style={{
        background: V2.black,
        padding: '96px 40px',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader
          index="02"
          title="5_ZONES · UNE_EXPÉRIENCE"
          subtitle="Architecture complète du venue // 3 étages // 3000 m²"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 1,
            background: `${V2.green}11`,
          }}
        >
          {displayZones.map((zone, i) => (
            <div key={zone.id} style={{ background: V2.black, padding: 1 }}>
              <ZoneCard zone={zone} index={i} />
            </div>
          ))}
        </div>

        {/* Floor plan legend */}
        <div
          style={{
            marginTop: 32,
            display: 'flex',
            gap: 32,
            padding: '16px 24px',
            border: `1px solid ${V2.green}22`,
            alignItems: 'center',
          }}
        >
          <MonoText size={9} color={V2.green} style={{ opacity: 0.4 }}>LÉGENDE:</MonoText>
          {['RDC · VESTIAIRES + BAR', 'N1 · SAUNA + HAMMAM + PISCINE', 'N2 · CRUISING + SPORT + CABINES'].map((l) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, border: `1px solid ${V2.green}`, opacity: 0.6 }} />
              <MonoText size={9} color={V2.green} style={{ opacity: 0.55 }}>{l}</MonoText>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
