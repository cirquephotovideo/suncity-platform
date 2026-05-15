import { V2, MonoText, SchematicBox, SectionHeader, DataTag } from './V2Atoms';

const MONO = "'JetBrains Mono', 'Space Mono', 'Courier New', monospace";

type Tariff = {
  id?: string;
  code: string;
  priceCents: number;
  daysApplicable?: string[];
  conditionLabel?: string | null;
  translations: { label: string; details?: string | null }[];
};

const FALLBACK_TARIFFS: Tariff[] = [
  {
    code: 'STANDARD',
    priceCents: 1800,
    daysApplicable: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY'],
    conditionLabel: null,
    translations: [{ label: 'Entrée Standard', details: 'Accès complet toutes zones. Serviette incluse.' }],
  },
  {
    code: 'MOINS26',
    priceCents: 1000,
    daysApplicable: ['TUESDAY'],
    conditionLabel: 'Justificatif requis',
    translations: [{ label: 'Tarif -26 ans', details: 'Mardi uniquement. Carte d\'identité obligatoire.' }],
  },
  {
    code: 'WEEKEND',
    priceCents: 2200,
    daysApplicable: ['FRIDAY','SATURDAY'],
    conditionLabel: null,
    translations: [{ label: 'Entrée Week-end', details: 'Vendredi & Samedi. Nuit ouverte jusqu\'à 6h.' }],
  },
  {
    code: 'ABONNEMENT',
    priceCents: 8000,
    daysApplicable: [],
    conditionLabel: 'Mensuel',
    translations: [{ label: 'Abonnement Mensuel', details: 'Accès illimité 30 jours. Économies garanties.' }],
  },
  {
    code: 'CARNET10',
    priceCents: 14000,
    daysApplicable: [],
    conditionLabel: 'Carnet 10 entrées',
    translations: [{ label: 'Carnet 10 Entrées', details: 'Valable 6 mois. Non remboursable. Transférable.' }],
  },
];

const DAY_ABBR: Record<string, string> = {
  MONDAY: 'L', TUESDAY: 'Ma', WEDNESDAY: 'Me', THURSDAY: 'J',
  FRIDAY: 'V', SATURDAY: 'S', SUNDAY: 'D',
};

function PriceCard({ tariff, featured = false }: { tariff: Tariff; featured?: boolean }) {
  const t = tariff.translations[0];
  const label = t?.label ?? tariff.code;
  const details = t?.details ?? '';
  const price = tariff.priceCents / 100;
  const euros = Math.floor(price);
  const cents = String(Math.round((price - euros) * 100)).padStart(2, '0');

  return (
    <SchematicBox
      label={tariff.code}
      style={{
        background: featured ? `${V2.green}0A` : V2.gray,
        display: 'flex',
        flexDirection: 'column',
        border: featured ? `1px solid ${V2.green}66` : `1px solid ${V2.green}22`,
      }}
    >
      {/* Price display */}
      <div
        style={{
          padding: '32px 28px 20px',
          borderBottom: `1px solid ${V2.green}22`,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 48,
            fontWeight: 900,
            color: featured ? V2.green : V2.green,
            lineHeight: 1,
            opacity: featured ? 1 : 0.8,
          }}
        >
          {euros}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 20,
            fontWeight: 700,
            color: V2.green,
            opacity: 0.6,
            paddingBottom: 8,
          }}
        >
          .{cents}€
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '20px 28px', flex: 1 }}>
        <MonoText size={14} weight={700} color={V2.green} style={{ display: 'block', marginBottom: 8 }}>
          {label}
        </MonoText>
        {details && (
          <MonoText size={10} color={V2.green} style={{ opacity: 0.55, display: 'block', lineHeight: 1.6, marginBottom: 12 }}>
            {details}
          </MonoText>
        )}
        {tariff.conditionLabel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 4, height: 4, background: V2.green, opacity: 0.4 }} />
            <MonoText size={9} color={V2.green} style={{ opacity: 0.5 }}>
              {tariff.conditionLabel}
            </MonoText>
          </div>
        )}
        {(tariff.daysApplicable ?? []).length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(tariff.daysApplicable ?? []).map((d) => (
              <span
                key={d}
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  color: V2.green,
                  border: `1px solid ${V2.green}44`,
                  padding: '2px 6px',
                  opacity: 0.7,
                  letterSpacing: '0.1em',
                }}
              >
                {DAY_ABBR[d] ?? d}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '16px 28px', borderTop: `1px solid ${V2.green}22` }}>
        <a
          href="https://sun.pixeeplay.com/billetterie"
          style={{
            display: 'block',
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: featured ? V2.black : V2.green,
            background: featured ? V2.green : 'transparent',
            border: featured ? 'none' : `1px solid ${V2.green}44`,
            padding: '10px 16px',
            textAlign: 'center',
            textDecoration: 'none',
            fontWeight: featured ? 700 : 400,
          }}
        >
          {featured ? 'RÉSERVER →' : 'ACHETER →'}
        </a>
      </div>
    </SchematicBox>
  );
}

export default function V2Pricing({ tariffs }: { tariffs: Tariff[] }) {
  const displayTariffs = tariffs.length > 0 ? tariffs : FALLBACK_TARIFFS;
  const featuredIdx = displayTariffs.findIndex((t) => t.code === 'WEEKEND' || t.code === 'STANDARD');

  return (
    <section
      id="pricing"
      style={{
        background: V2.black,
        padding: '96px 40px',
        borderTop: `1px solid ${V2.green}22`,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader
          index="04"
          title="TARIFS_ACCÈS"
          subtitle="Entrée = accès complet toutes zones // serviette incluse"
        />

        {/* Pricing grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 1,
            background: `${V2.green}11`,
          }}
        >
          {displayTariffs.map((tariff, i) => (
            <div key={tariff.code} style={{ background: V2.black, padding: 1 }}>
              <PriceCard tariff={tariff} featured={i === featuredIdx} />
            </div>
          ))}
        </div>

        {/* Info strip */}
        <div
          style={{
            marginTop: 32,
            padding: '16px 24px',
            border: `1px solid ${V2.green}22`,
            display: 'flex',
            gap: 40,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <DataTag label="PAIEMENT" value="CB + ESPÈCES" />
          <DataTag label="INCLUS" value="SERVIETTE + CASIER" />
          <DataTag label="TENUE" value="OBLIGATOIRE_18+" />
          <div style={{ flex: 1 }} />
          <MonoText size={9} color={V2.green} style={{ opacity: 0.35 }}>
            Tarifs susceptibles de varier en soirées spéciales.
          </MonoText>
        </div>
      </div>
    </section>
  );
}
