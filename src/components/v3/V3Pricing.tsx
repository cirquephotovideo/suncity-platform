import { prisma } from '@/lib/prisma';
import { V3, Blob, Pill, Glass, ChromeText } from './V3Atoms';

const INCLUDES = [
  'Entrée au sauna complet',
  '2 boissons offertes',
  '2 serviettes (+1€ la suivante)',
  'Préservatifs à volonté',
];

function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(0)}€`;
}

export async function V3Pricing({ locale }: { locale: string }) {
  const tariffs = await prisma.tariff.findMany({
    where: { active: true },
    include: { translations: { where: { locale: locale as any } } },
    orderBy: { orderIndex: 'asc' },
  }).catch(() => []);

  // Récupère tarif max semaine (full) + tarif jeune semaine
  const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
  const weekends = ['FRIDAY', 'SATURDAY', 'SUNDAY'];

  const wdayFull = tariffs.find(t => t.daysApplicable.some(d => weekdays.includes(d)) && !t.conditionLabel?.includes('26'));
  const wdayYoung = tariffs.find(t => t.daysApplicable.some(d => weekdays.includes(d)) && t.conditionLabel?.includes('26'));
  const weekendFull = tariffs.find(t => t.daysApplicable.some(d => weekends.includes(d)) && !t.conditionLabel?.includes('26') && !t.conditionLabel?.includes('après'));
  const weekendYoung = tariffs.find(t => t.daysApplicable.some(d => weekends.includes(d)) && t.conditionLabel?.includes('26'));
  const weekendLate = tariffs.find(t => t.conditionLabel?.includes('après'));
  const tueSpecial = tariffs.find(t => t.daysApplicable.length === 1 && t.daysApplicable[0] === 'TUESDAY');

  return (
    <section style={{ padding: '80px 56px', position: 'relative' }}>
      <Blob size={500} color={V3.cyan} style={{ position: 'absolute', top: 100, left: -100, opacity: 0.6 }} />

      <div style={{ textAlign: 'center', marginBottom: 60, position: 'relative', zIndex: 2 }}>
        <Pill bg="transparent" style={{ border: `1.5px solid ${V3.magenta}`, color: V3.magenta }}>
          § 04 / TARIFS
        </Pill>
        <h2 style={{
          fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 900,
          fontSize: 96, lineHeight: 0.95, margin: '24px 0 0',
          letterSpacing: '-0.04em', color: V3.white,
        }}>
          <ChromeText size={96}>combien ça coûte.</ChromeText>
        </h2>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 24,
        position: 'relative', zIndex: 2,
      }}>
        <Glass tone="cyan">
          <div style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontSize: 11, color: V3.cyan, letterSpacing: 2, marginBottom: 16 }}>
            ⌒ LUNDI → JEUDI
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <ChromeText size={100}>{formatPrice(wdayFull?.priceCents ?? 2200)}</ChromeText>
              <div style={{ fontSize: 13, color: V3.white, opacity: 0.6, marginTop: 4, fontFamily: 'var(--font-body), sans-serif' }}>plein</div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 900,
                fontSize: 72, lineHeight: 0.85, color: V3.cyan,
                textShadow: `0 0 24px ${V3.cyan}88`,
              }}>
                {formatPrice(wdayYoung?.priceCents ?? 1400)}
              </div>
              <div style={{ fontSize: 13, color: V3.cyan, marginTop: 4, fontFamily: 'var(--font-body), sans-serif', fontWeight: 600 }}>-26 ans</div>
            </div>
          </div>
          {tueSpecial && (
            <div style={{
              marginTop: 24, padding: 16,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${V3.magenta}, ${V3.cyan})`,
              color: V3.white,
              fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 600, fontSize: 13,
              letterSpacing: 1,
              boxShadow: `0 0 24px ${V3.magenta}88, inset 0 1px 0 ${V3.white}55`,
            }}>
              ✦ MARDI · {formatPrice(tueSpecial.priceCents)} SI T'AS -26
            </div>
          )}
        </Glass>

        <Glass tone="magenta">
          <div style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontSize: 11, color: V3.magenta, letterSpacing: 2, marginBottom: 16 }}>
            ⌒ VENDREDI → DIMANCHE
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <ChromeText size={100} gradient={`linear-gradient(180deg, ${V3.magenta}, ${V3.white}, ${V3.cyan})`}>
                {formatPrice(weekendFull?.priceCents ?? 2500)}
              </ChromeText>
              <div style={{ fontSize: 13, color: V3.white, opacity: 0.6, marginTop: 4, fontFamily: 'var(--font-body), sans-serif' }}>plein</div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 900,
                fontSize: 72, lineHeight: 0.85, color: V3.magenta,
                textShadow: `0 0 24px ${V3.magenta}88`,
              }}>
                {formatPrice(weekendYoung?.priceCents ?? 1700)}
              </div>
              <div style={{ fontSize: 13, color: V3.magenta, marginTop: 4, fontFamily: 'var(--font-body), sans-serif', fontWeight: 600 }}>-26 ans</div>
            </div>
          </div>
          {weekendLate && (
            <div style={{
              marginTop: 24, padding: 16,
              borderRadius: 16,
              border: `1.5px solid ${V3.magenta}`,
              color: V3.magenta,
              fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 600, fontSize: 13,
              letterSpacing: 1,
            }}>
              ✦ {formatPrice(weekendLate.priceCents)} APRÈS 3H VEN-SAM
            </div>
          )}
        </Glass>

        <Glass tone="cyan" style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontFamily: 'var(--font-unbounded), sans-serif', fontSize: 11, color: V3.cyan, letterSpacing: 2, marginBottom: 20 }}>
            ⌒ TOUT EST INCLUS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {INCLUDES.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  flex: '0 0 36px', height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${V3.cyan}, ${V3.magenta})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-unbounded), sans-serif', fontWeight: 700, fontSize: 14,
                  color: V3.white,
                  boxShadow: `0 0 16px ${V3.magenta}66`,
                }}>
                  ✦
                </div>
                <div style={{
                  fontFamily: 'var(--font-body), sans-serif', fontSize: 15, fontWeight: 600,
                  color: V3.white, lineHeight: 1.3, paddingTop: 6,
                }}>
                  {it}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 24, fontSize: 12, color: V3.white, opacity: 0.6,
            fontFamily: 'var(--font-body), sans-serif',
          }}>
            Tarif jeune sur présentation d'une pièce d'identité. -26 ans uniquement.
          </div>
        </Glass>
      </div>
    </section>
  );
}
