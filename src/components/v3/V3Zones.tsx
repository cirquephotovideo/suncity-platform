import { prisma } from '@/lib/prisma';
import { V3, Blob, Pill, Glass, ChromeText } from './V3Atoms';

export async function V3Zones({ locale }: { locale: string }) {
  const locations = await prisma.location.findMany({
    where: { active: true },
    include: { translations: { where: { locale: locale as any } } },
    orderBy: { orderIndex: 'asc' },
  }).catch(() => []);

  return (
    <section style={{ padding: '120px 56px 80px', position: 'relative' }}>
      <Blob size={600} color={V3.cyan} style={{ position: 'absolute', top: 200, left: -200, opacity: 0.5 }} />

      <div style={{ textAlign: 'center', marginBottom: 60, position: 'relative', zIndex: 2 }}>
        <Pill bg="transparent" style={{ border: `1.5px solid ${V3.magenta}`, color: V3.magenta }}>
          § 02 / LE LIEU
        </Pill>
        <h2 style={{
          fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 900,
          fontSize: 96, lineHeight: 0.95, margin: '24px 0 16px',
          letterSpacing: '-0.04em', color: V3.white,
        }}>
          {locations.length} zones.<br />
          <ChromeText size={96}>un terrain de jeu.</ChromeText>
        </h2>
        <div style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 18, color: V3.white, opacity: 0.7, maxWidth: 580, margin: '0 auto', lineHeight: 1.5 }}>
          De la piscine au cruising en passant par le sport. Tout est connecté. Tout est ouvert.
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24,
        position: 'relative', zIndex: 2,
      }}>
        {locations.map((z, i) => {
          const tr = z.translations[0];
          const num = String(i + 1).padStart(2, '0');
          const tone: 'magenta' | 'cyan' = i % 2 === 0 ? 'magenta' : 'cyan';
          return (
            <Glass key={z.id} tone={tone} padding={0} style={{ overflow: 'hidden' }}>
              <div style={{
                width: '100%', height: 240, position: 'relative',
                background: i % 2 === 0
                  ? `linear-gradient(135deg, ${V3.magenta}55, ${V3.cyan}55)`
                  : `linear-gradient(135deg, ${V3.cyan}55, ${V3.magenta}55)`,
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -20, right: -20, width: 180, height: 180,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 30%, ${V3.white}66, transparent 70%)`,
                  filter: 'blur(30px)',
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 700,
                  fontSize: 80, color: V3.white + '88',
                  textShadow: `0 0 24px ${V3.white}AA`,
                }}>
                  ⌒
                </div>
                {z.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={z.coverImageUrl} alt={tr?.title ?? z.slug} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    position: 'absolute', bottom: 12, left: 16,
                    fontFamily: 'var(--font-body), sans-serif', fontSize: 11, color: V3.white,
                    opacity: 0.7, letterSpacing: 1.5,
                  }}>
                    [ DROP PHOTO ]
                  </div>
                )}
              </div>

              <div style={{ padding: 28 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-unbounded), sans-serif', fontSize: 11, fontWeight: 600,
                  color: i % 2 === 0 ? V3.magenta : V3.cyan, letterSpacing: 2,
                  marginBottom: 12,
                }}>
                  ZONE_{num} ━ {String(locations.length).padStart(2, '0')}
                </div>
                <div style={{
                  fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 700,
                  fontSize: 24, lineHeight: 1.1, letterSpacing: '-0.02em', color: V3.white,
                }}>
                  {tr?.title ?? z.slug}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body), sans-serif', fontSize: 14, color: V3.white,
                  opacity: 0.7, marginTop: 10, lineHeight: 1.4,
                }}>
                  {tr?.summary ?? ''}
                </div>
              </div>
            </Glass>
          );
        })}
      </div>
    </section>
  );
}
