import { V3, Glass, ChromeText } from './V3Atoms';

const FACTS = [
  { big: '3000', unit: 'm²',       label: 'de plaisir' },
  { big: '3',    unit: 'étages',   label: 'à explorer' },
  { big: '7/7',  unit: 'jours',    label: 'ouvert' },
  { big: '14h',  unit: 'non-stop', label: 'ven-sam-dim' },
];

export function V3Strip() {
  return (
    <section style={{ padding: '0 56px', position: 'relative', zIndex: 2 }}>
      <Glass tone="cyan" padding={0} style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', overflow: 'hidden',
      }}>
        {FACTS.map((f, i) => (
          <div key={i} style={{
            padding: 32,
            borderRight: i < 3 ? `1px solid ${V3.white}22` : 'none',
            textAlign: 'center',
          }}>
            <ChromeText size={72}>{f.big}</ChromeText>
            <div style={{
              fontFamily: 'var(--font-body), sans-serif', fontWeight: 700, fontSize: 14,
              marginTop: 6, color: V3.cyan, letterSpacing: 1,
            }}>
              {f.unit.toUpperCase()}
            </div>
            <div style={{
              fontFamily: 'var(--font-body), sans-serif', fontSize: 12,
              color: V3.white, opacity: 0.7, marginTop: 4,
            }}>
              {f.label}
            </div>
          </div>
        ))}
      </Glass>
    </section>
  );
}
