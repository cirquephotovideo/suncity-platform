import { V4, EditorialText, MonoLabel, MoonPattern } from './V4Atoms';

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

interface Tariff {
  code: string;
  priceCents: number;
  daysApplicable: DayOfWeek[];
  conditionLabel: string | null;
  translations: { label: string; details: string | null }[];
}

interface V4PricingProps {
  locale: string;
  tariffs: Tariff[];
}

const DAY_SHORT_FR: Record<DayOfWeek, string> = {
  MONDAY: 'L', TUESDAY: 'Ma', WEDNESDAY: 'Me', THURSDAY: 'J',
  FRIDAY: 'V', SATURDAY: 'S', SUNDAY: 'D',
};
const DAY_SHORT_EN: Record<DayOfWeek, string> = {
  MONDAY: 'M', TUESDAY: 'T', WEDNESDAY: 'W', THURSDAY: 'T',
  FRIDAY: 'F', SATURDAY: 'S', SUNDAY: 'S',
};

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(0)}€`;
}

export default function V4Pricing({ locale, tariffs }: V4PricingProps) {
  const isFr = locale === 'fr';
  const dayMap = isFr ? DAY_SHORT_FR : DAY_SHORT_EN;

  return (
    <section
      id="tarifs"
      style={{
        background: V4.night,
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 60px',
      }}
    >
      <MoonPattern size={260} color={V4.moon} opacity={0.07} id="pricing-moon" />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 72 }}>
          <MonoLabel size={10} color={`${V4.moon}60`} style={{ marginBottom: 24, display: 'block' }}>
            {isFr ? 'Entrées & tarifs' : 'Entry & pricing'}
          </MonoLabel>
          <EditorialText size={64} color={V4.cream} style={{ display: 'block' }}>
            {isFr ? 'Combien' : 'How much'}
          </EditorialText>
          <EditorialText
            size={64}
            color={V4.moon}
            style={{
              display: 'block',
              fontStyle: 'italic',
              fontVariationSettings: '"opsz" 144, "WONK" 1, "SOFT" 100',
            }}
          >
            {isFr ? 'ça coûte ?' : 'does it cost?'}
          </EditorialText>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: `${V4.cream}40`,
              letterSpacing: '0.06em',
              marginTop: 24,
              maxWidth: 400,
            }}
          >
            {isFr
              ? 'Serviette incluse · Casier gratuit · Vestiaire sécurisé'
              : 'Towel included · Free locker · Secure changing room'}
          </p>
        </div>

        {/* Grille tarifs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 2,
          }}
        >
          {tariffs.length === 0
            ? FALLBACK_TARIFFS(isFr).map((t, i) => (
                <TariffCard key={i} tariff={t} isFr={isFr} dayMap={dayMap} />
              ))
            : tariffs.map((t) => {
                const tr = t.translations[0];
                return (
                  <TariffCard
                    key={t.code}
                    isFr={isFr}
                    dayMap={dayMap}
                    tariff={{
                      label: tr?.label ?? t.code,
                      price: formatPrice(t.priceCents),
                      details: tr?.details ?? t.conditionLabel ?? '',
                      days: t.daysApplicable,
                    }}
                  />
                );
              })}
        </div>

        {/* Note bas */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 32,
            borderTop: `1px solid ${V4.moon}15`,
            display: 'flex',
            gap: 40,
            flexWrap: 'wrap',
          }}
        >
          {[
            isFr ? '🛁 Serviette incluse' : '🛁 Towel included',
            isFr ? '🔑 Casier offert' : '🔑 Free locker',
            isFr ? '🧴 Produits de soin fournis' : '🧴 Care products provided',
            isFr ? '💳 CB acceptée' : '💳 Card accepted',
          ].map((n, i) => (
            <MonoLabel key={i} size={10} color={`${V4.cream}40`}>
              {n}
            </MonoLabel>
          ))}
        </div>
      </div>
    </section>
  );
}

interface TariffCardData {
  label: string;
  price: string;
  details?: string;
  days?: DayOfWeek[];
}

function TariffCard({
  tariff,
  isFr,
  dayMap,
}: {
  tariff: TariffCardData;
  isFr: boolean;
  dayMap: Record<DayOfWeek, string>;
}) {
  return (
    <div
      style={{
        background: `${V4.dusk}`,
        border: `1px solid ${V4.moon}10`,
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: "'Fraunces', 'Playfair Display', serif",
          fontVariationSettings: '"opsz" 72, "WONK" 0, "SOFT" 60',
          fontSize: 48,
          fontWeight: 300,
          color: V4.moon,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {tariff.price}
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Fraunces', 'Playfair Display', serif",
            fontVariationSettings: '"opsz" 72, "WONK" 0, "SOFT" 60',
            fontSize: 18,
            fontWeight: 300,
            color: V4.cream,
            letterSpacing: '-0.01em',
          }}
        >
          {tariff.label}
        </div>
        {tariff.details && (
          <MonoLabel size={10} color={`${V4.cream}40`} style={{ display: 'block', marginTop: 8 }}>
            {tariff.details}
          </MonoLabel>
        )}
      </div>
      {tariff.days && tariff.days.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
          {(['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] as DayOfWeek[]).map((d) => {
            const active = tariff.days!.includes(d);
            return (
              <span
                key={d}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.05em',
                  color: active ? V4.night : `${V4.cream}20`,
                  background: active ? V4.moon : 'transparent',
                  border: `1px solid ${active ? V4.moon : `${V4.cream}10`}`,
                  borderRadius: 2,
                  padding: '3px 6px',
                  fontWeight: active ? 700 : 400,
                }}
              >
                {dayMap[d]}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FALLBACK_TARIFFS(isFr: boolean): TariffCardData[] {
  return [
    {
      label: isFr ? 'Tarif standard' : 'Standard rate',
      price: '12€',
      details: isFr ? 'Lundi au jeudi' : 'Monday to Thursday',
      days: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY'],
    },
    {
      label: isFr ? 'Tarif soirée' : 'Evening rate',
      price: '15€',
      details: isFr ? 'Vendredi & événements' : 'Friday & events',
      days: ['FRIDAY'],
    },
    {
      label: isFr ? 'Weekend' : 'Weekend',
      price: '18€',
      details: isFr ? 'Samedi & dimanche' : 'Saturday & Sunday',
      days: ['SATURDAY','SUNDAY'],
    },
    {
      label: isFr ? 'Jeunes — 26 ans &' : 'Youth — 26 & under',
      price: '9€',
      details: isFr ? 'Sur présentation pièce d\'identité' : 'With valid ID',
      days: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY'],
    },
  ];
}
