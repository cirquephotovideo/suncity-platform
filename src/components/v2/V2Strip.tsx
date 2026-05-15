import { V2, MonoText } from './V2Atoms';

const ITEMS = [
  'SAUNA_GAY_PARIS',
  '3000_M2',
  'OUVERT_7J/7',
  'HAMMAM',
  'PISCINE',
  'JACUZZI',
  'CABINES_PRIVÉES',
  'BAR',
  'SPORT',
  'CRUISING',
  '3_ÉTAGES',
  '12H→06H',
];

export default function V2Strip() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div
      style={{
        background: V2.green,
        overflow: 'hidden',
        borderTop: `2px solid ${V2.green}`,
        borderBottom: `2px solid ${V2.green}`,
        position: 'relative',
        height: 36,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 0,
          animation: 'scrollLeft 30s linear infinite',
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}
      >
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <MonoText size={11} weight={700} color={V2.black} style={{ padding: '0 20px', letterSpacing: '0.2em' }}>
              {item}
            </MonoText>
            <span style={{ color: V2.black, opacity: 0.4, fontSize: 10 }}>◆</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
