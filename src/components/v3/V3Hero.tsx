import { Link } from '@/i18n/routing';
import { V3, Blob, Pill, ChromeText } from './V3Atoms';

export function V3Hero() {
  return (
    <section style={{ position: 'relative', padding: '40px 56px 80px', minHeight: 900 }}>
      <Blob size={500} color={V3.magenta} style={{ position: 'absolute', top: 100, left: -100, opacity: 0.8 }} />
      <Blob size={400} color={V3.cyan} style={{ position: 'absolute', top: 300, right: -100, opacity: 0.6 }} />
      <Blob size={200} color={V3.magenta} style={{ position: 'absolute', bottom: 100, left: '40%', opacity: 0.5 }} />

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 40, marginBottom: 60, position: 'relative', zIndex: 2 }}>
        <Pill bg={V3.magenta}>● LIVE · OPEN NOW</Pill>
        <Pill bg="transparent" style={{ border: `1.5px solid ${V3.cyan}`, color: V3.cyan, boxShadow: `0 0 16px ${V3.cyan}55` }}>
          ⌖ PARIS 75003
        </Pill>
        <Pill bg="transparent" style={{ border: `1.5px solid ${V3.white}55`, color: V3.white }}>
          ★ EST. 2003
        </Pill>
      </div>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <ChromeText size={280}>SUN</ChromeText>
        <br />
        <ChromeText size={280} gradient={`linear-gradient(180deg, ${V3.cyan} 0%, ${V3.white} 30%, ${V3.magenta} 70%, ${V3.cyan} 100%)`}>
          CITY
        </ChromeText>
      </div>

      <div style={{
        textAlign: 'center', maxWidth: 760, margin: '60px auto 0',
        fontFamily: 'var(--font-body), sans-serif', fontWeight: 500,
        fontSize: 24, lineHeight: 1.35, color: V3.white,
        letterSpacing: '-0.01em',
        position: 'relative', zIndex: 2,
        padding: '0 16px',
      }}>
        Le plus grand sauna gay de Paris.<br />
        <span style={{
          background: `linear-gradient(90deg, ${V3.cyan}, ${V3.magenta})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
        }}>3000 m². 3 étages. Zero filter.</span>
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 48, position: 'relative', zIndex: 2 }}>
        <Link href="/billetterie" style={{ textDecoration: 'none' }}>
          <span style={{
            padding: '20px 36px',
            borderRadius: 999,
            background: `linear-gradient(135deg, ${V3.magenta}, ${V3.cyan})`,
            color: V3.white,
            fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 700, fontSize: 16,
            letterSpacing: 1,
            boxShadow: `0 0 40px ${V3.magenta}AA, inset 0 2px 0 ${V3.white}55`,
            display: 'inline-block',
          }}>
            ENTRER 18+ →
          </span>
        </Link>
        <Link href="/agenda" style={{ textDecoration: 'none' }}>
          <span style={{
            padding: '20px 36px',
            borderRadius: 999,
            background: V3.white + '0a',
            backdropFilter: 'blur(20px)',
            border: `1.5px solid ${V3.white}33`,
            color: V3.white,
            fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 600, fontSize: 16,
            letterSpacing: 1,
            display: 'inline-block',
          }}>
            VOIR L'AGENDA
          </span>
        </Link>
      </div>
    </section>
  );
}
