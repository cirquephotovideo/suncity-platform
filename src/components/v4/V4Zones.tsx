import { V4, EditorialText, MonoLabel, MoonPattern, SoftDivider } from './V4Atoms';

interface LocationData {
  id: string;
  slug: string;
  iconKey: string | null;
  coverImageUrl: string | null;
  translations: { title: string; summary: string | null; contentMd: string | null }[];
}

interface V4ZonesProps {
  locale: string;
  locations: LocationData[];
}

const ICON_MAP: Record<string, string> = {
  waves: '〜',
  thermometer: '◈',
  droplets: '◉',
  dumbbell: '◆',
  moon: '☽',
  star: '★',
  heart: '♡',
  key: '⚷',
  default: '◎',
};

// Couleurs douces séquencées Marine Serre
const ZONE_COLORS = [
  { bg: V4.dusk,   text: V4.cream  },
  { bg: V4.cream,  text: V4.night  },
  { bg: '#1A2338', text: V4.moon   },
  { bg: V4.mist,   text: V4.night  },
  { bg: '#0D1630', text: V4.soft   },
];

export default function V4Zones({ locale, locations }: V4ZonesProps) {
  const isFr = locale === 'fr';
  const title1 = isFr ? '5 zones,' : '5 spaces,';
  const title2 = isFr ? 'une expérience.' : 'one experience.';
  const subtitle = isFr
    ? 'Chaque espace a sa propre atmosphère, son propre rythme.'
    : 'Each space has its own atmosphere, its own pace.';

  return (
    <section
      id="zones"
      style={{
        background: V4.night,
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 0',
      }}
    >
      <MoonPattern size={240} color={V4.moon} opacity={0.06} id="zones-moon" />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header section */}
        <div style={{ padding: '0 60px 80px', maxWidth: 700 }}>
          <MonoLabel size={10} color={`${V4.moon}60`} style={{ marginBottom: 24, display: 'block' }}>
            {isFr ? 'Les espaces' : 'The spaces'}
          </MonoLabel>
          <EditorialText size={72} color={V4.cream} style={{ display: 'block' }}>
            {title1}
          </EditorialText>
          <EditorialText
            size={72}
            color={V4.moon}
            style={{
              display: 'block',
              fontStyle: 'italic',
              fontVariationSettings: '"opsz" 144, "WONK" 1, "SOFT" 100',
            }}
          >
            {title2}
          </EditorialText>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: `${V4.cream}50`,
              letterSpacing: '0.06em',
              marginTop: 24,
              maxWidth: 420,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Grille zones */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 2,
          }}
        >
          {locations.length === 0
            ? FALLBACK_ZONES(isFr).map((z, i) => (
                <ZoneCard key={i} zone={z} colors={ZONE_COLORS[i % ZONE_COLORS.length]} index={i} />
              ))
            : locations.map((loc, i) => {
                const t = loc.translations[0];
                return (
                  <ZoneCard
                    key={loc.id}
                    zone={{
                      icon: ICON_MAP[loc.iconKey ?? 'default'] ?? ICON_MAP.default,
                      title: t?.title ?? loc.slug,
                      summary: t?.summary ?? '',
                    }}
                    colors={ZONE_COLORS[i % ZONE_COLORS.length]}
                    index={i}
                    coverUrl={loc.coverImageUrl}
                  />
                );
              })}
        </div>
      </div>
    </section>
  );
}

function ZoneCard({
  zone,
  colors,
  index,
  coverUrl,
}: {
  zone: { icon: string; title: string; summary: string };
  colors: { bg: string; text: string };
  index: number;
  coverUrl?: string | null;
}) {
  return (
    <div
      style={{
        background: colors.bg,
        position: 'relative',
        overflow: 'hidden',
        padding: '56px 48px',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {coverUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
          }}
        />
      )}

      {/* Index numéro */}
      <span
        style={{
          position: 'absolute',
          top: 28,
          right: 36,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: `${colors.text}30`,
          letterSpacing: '0.08em',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 28, marginBottom: 20, opacity: 0.7 }}>{zone.icon}</div>
        <h3
          style={{
            fontFamily: "'Fraunces', 'Playfair Display', serif",
            fontVariationSettings: '"opsz" 144, "WONK" 1, "SOFT" 80',
            fontSize: 28,
            fontWeight: 300,
            color: colors.text,
            margin: '0 0 12px',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {zone.title}
        </h3>
        {zone.summary && (
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: `${colors.text}60`,
              letterSpacing: '0.04em',
              margin: 0,
              maxWidth: 280,
              lineHeight: 1.6,
            }}
          >
            {zone.summary}
          </p>
        )}
      </div>
    </div>
  );
}

function FALLBACK_ZONES(isFr: boolean) {
  return [
    {
      icon: '〜',
      title: isFr ? 'Piscine & Jacuzzi' : 'Pool & Jacuzzi',
      summary: isFr ? 'Eau chauffée à 32°, lumière tamisée, espace détente aquatique.' : 'Heated pool at 32°, soft lighting, aquatic relaxation.',
    },
    {
      icon: '◈',
      title: isFr ? 'Sauna & Hammam' : 'Sauna & Steam Room',
      summary: isFr ? 'Chaleur sèche finlandaise et vapeur aromatisée.' : 'Finnish dry heat and aromatic steam.',
    },
    {
      icon: '◉',
      title: isFr ? 'Espace Drague' : 'Darkroom',
      summary: isFr ? 'Zone privée, ambiance tamisée, liberté totale.' : 'Private area, dim ambiance, total freedom.',
    },
    {
      icon: '◆',
      title: isFr ? 'Salle Sport & Fitness' : 'Gym & Fitness',
      summary: isFr ? 'Équipements complets, espace cardio et musculation.' : 'Full equipment, cardio and strength training.',
    },
    {
      icon: '☽',
      title: isFr ? 'Lounge & Bar' : 'Lounge & Bar',
      summary: isFr ? 'Cocktails sans alcool, ambiance music, canapés profonds.' : 'Non-alcoholic cocktails, music vibes, deep sofas.',
    },
  ];
}
