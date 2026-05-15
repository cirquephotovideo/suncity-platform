import { V4, MonoLabel } from './V4Atoms';

interface V4StripProps {
  locale: string;
  items?: string[];
}

export default function V4Strip({ locale, items }: V4StripProps) {
  const isFr = locale === 'fr';
  const defaults = isFr
    ? [
        'Sauna · Hammam · Piscine',
        'Soirées thématiques chaque soir',
        'Ambiance Marine Serre × Club Gay',
        'Ouvert 7j/7 · Jusqu\'à 6h le week-end',
        'Espace de détente · Vestiaires privés',
        'Agenda renouvelé chaque semaine',
      ]
    : [
        'Sauna · Steam Room · Pool',
        'Themed parties every night',
        'Marine Serre × Gay Club ambiance',
        'Open 7/7 · Until 6am weekends',
        'Relaxation space · Private lockers',
        'Fresh lineup every week',
      ];
  const strip = items ?? defaults;
  const repeated = [...strip, ...strip]; // loop visuel

  return (
    <div
      style={{
        background: V4.night,
        borderTop: `1px solid ${V4.moon}20`,
        borderBottom: `1px solid ${V4.moon}20`,
        padding: '14px 0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 48,
          whiteSpace: 'nowrap',
          animation: 'v4-strip-scroll 40s linear infinite',
        }}
      >
        {repeated.map((item, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 48, flexShrink: 0 }}>
            <MonoLabel size={10} color={`${V4.moon}80`}>
              {item}
            </MonoLabel>
            <svg width="6" height="6" viewBox="0 0 6 6">
              <circle cx="3" cy="3" r="3" fill={V4.moon} opacity={0.3} />
            </svg>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes v4-strip-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
