import { prisma } from '@/lib/prisma';
import { V3, Blob, Pill, Glass, ChromeText } from './V3Atoms';

const DAY_LABEL: Record<string, string> = {
  MONDAY: 'LUN', TUESDAY: 'MAR', WEDNESDAY: 'MER', THURSDAY: 'JEU',
  FRIDAY: 'VEN', SATURDAY: 'SAM', SUNDAY: 'DIM',
};

const WOM_LABEL: Record<string, string> = {
  ALL: 'Toutes les semaines', ODD: '1ᵉʳ + 3ᵉ du mois', EVEN: '2ᵉ + 4ᵉ du mois',
  W1: '1ᵉʳ du mois', W2: '2ᵉ du mois', W3: '3ᵉ du mois', W4: '4ᵉ du mois', W5: '5ᵉ du mois',
};

export async function V3Agenda({ locale }: { locale: string }) {
  const events = await prisma.recurringEvent.findMany({
    where: { active: true },
    include: { translations: { where: { locale: locale as any } } },
    orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
  }).catch(() => []);

  // Trouve l'event "actuel" — première occurrence active aujourd'hui
  const today = new Date();
  const todayEnum = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][today.getDay()];
  const current = events.find(e => e.dayOfWeek === todayEnum && (e.weekOfMonth === 'ALL' || true)) ?? events[0];
  const currentTr = current?.translations[0];

  return (
    <section style={{ padding: '80px 56px', position: 'relative' }}>
      <Blob size={500} color={V3.magenta} style={{ position: 'absolute', bottom: 100, right: -100, opacity: 0.6 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 48, position: 'relative', zIndex: 2 }}>
        <div>
          <Pill bg="transparent" style={{ border: `1.5px solid ${V3.cyan}`, color: V3.cyan }}>
            § 03 / AGENDA
          </Pill>
          <h2 style={{
            fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 900,
            fontSize: 96, lineHeight: 0.95, margin: '24px 0 0',
            letterSpacing: '-0.04em', color: V3.white,
          }}>
            t'as quoi<br />
            <ChromeText size={96}>ce soir ?</ChromeText>
          </h2>
        </div>
        {current && currentTr && (
          <Glass tone="magenta" style={{ maxWidth: 280 }}>
            <div style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontSize: 11, color: V3.magenta, letterSpacing: 2, marginBottom: 8 }}>
              EN CE MOMENT
            </div>
            <div style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 700, fontSize: 22, lineHeight: 1.1, marginBottom: 8, color: V3.white }}>
              {currentTr.title.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 13, color: V3.white, opacity: 0.7, lineHeight: 1.4 }}>
              {currentTr.summary ?? ''}
            </div>
          </Glass>
        )}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16,
        position: 'relative', zIndex: 2,
      }}>
        {events.map((e, i) => {
          const tr = e.translations[0];
          if (!tr) return null;
          const tone: 'magenta' | 'cyan' = i % 2 === 0 ? 'cyan' : 'magenta';
          const tag = WOM_LABEL[e.weekOfMonth] ?? 'Toutes les semaines';
          return (
            <Glass key={e.id} tone={tone} padding={24} style={{
              minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 900,
                fontSize: 56, lineHeight: 0.85,
                background: `linear-gradient(180deg, ${V3.white}, ${i % 2 === 0 ? V3.cyan : V3.magenta})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.04em',
              }}>
                {DAY_LABEL[e.dayOfWeek] ?? e.dayOfWeek.slice(0, 3)}
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 700,
                  fontSize: 18, lineHeight: 1.1, marginBottom: 8, color: V3.white,
                  letterSpacing: '-0.01em', textTransform: 'uppercase',
                }}>
                  {tr.title}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body), sans-serif', fontSize: 11, fontWeight: 600,
                  color: i % 2 === 0 ? V3.cyan : V3.magenta,
                  letterSpacing: 1.5, marginBottom: 8,
                  textTransform: 'uppercase',
                }}>
                  → {tag}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body), sans-serif', fontSize: 12,
                  color: V3.white, opacity: 0.7, lineHeight: 1.4,
                }}>
                  {tr.summary ?? e.priceLabel ?? ''}
                </div>
              </div>
            </Glass>
          );
        })}
      </div>
    </section>
  );
}
