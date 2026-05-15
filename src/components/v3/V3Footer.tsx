import { prisma } from '@/lib/prisma';
import { V3, Blob, Glass, ChromeText } from './V3Atoms';

export async function V3Footer() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  const phone = settings?.contactPhone ?? '01 40 09 26 09';
  const address = settings?.address ?? '62 boulevard de Sébastopol, 75003 Paris';

  return (
    <footer style={{ padding: '120px 56px 40px', position: 'relative' }}>
      <Blob size={800} color={V3.magenta} style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', opacity: 0.4 }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginBottom: 60 }}>
        <ChromeText size={220}>SUNCITY</ChromeText>
        <div style={{
          fontFamily: 'var(--font-body), sans-serif', fontSize: 18, color: V3.white, opacity: 0.8,
          marginTop: 12,
        }}>
          On t'attend.
        </div>
      </div>

      <Glass tone="cyan" padding={40} style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32,
        position: 'relative', zIndex: 2,
      }}>
        <div>
          <div style={{ fontSize: 11, color: V3.cyan, letterSpacing: 2, marginBottom: 12, fontFamily: 'var(--font-unbounded), sans-serif' }}>
            ⌒ ON EST OÙ
          </div>
          <div style={{ fontFamily: 'var(--font-body), sans-serif', fontWeight: 600, fontSize: 16, lineHeight: 1.5, color: V3.white }}>
            {address.split(',').slice(0, 1).join(',')}<br />
            {address.split(',').slice(1).join(',').trim()}<br />
            <span style={{ opacity: 0.7, fontWeight: 400 }}>M° Étienne Marcel · Réaumur-Sébastopol</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: V3.cyan, letterSpacing: 2, marginBottom: 12, fontFamily: 'var(--font-unbounded), sans-serif' }}>
            ⌒ APPELLE
          </div>
          <a href={`tel:${phone.replace(/\s/g, '')}`} style={{
            fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 700, fontSize: 32,
            color: V3.white, textDecoration: 'none',
          }}>
            {phone}
          </a>
        </div>
        <div>
          <div style={{ fontSize: 11, color: V3.cyan, letterSpacing: 2, marginBottom: 12, fontFamily: 'var(--font-unbounded), sans-serif' }}>
            ⌒ HORAIRES
          </div>
          <div style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 14, lineHeight: 1.6, color: V3.white }}>
            DIM-JEU · <span style={{ fontWeight: 700, color: V3.cyan }}>12h → 2h</span><br />
            VEN-SAM · <span style={{ fontWeight: 700, color: V3.magenta }}>12h → 6h</span>
          </div>
        </div>
      </Glass>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        marginTop: 40, fontSize: 11, color: V3.white, opacity: 0.5,
        letterSpacing: 1, fontFamily: 'var(--font-body), sans-serif',
      }}>
        <div>© SUNCITY · SARL GYM SEBASTOPOL · RCS 45274626600025</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>INSTA</span><span>FB</span><span>TWITTER</span>
        </div>
        <div>+18 · NO PHOTO · NO VIDEO</div>
      </div>
    </footer>
  );
}
