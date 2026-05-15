import { V2, MonoText, SchematicBox, SectionHeader, DataTag } from './V2Atoms';

const MONO = "'JetBrains Mono', 'Space Mono', 'Courier New', monospace";

type RecurringEvent = {
  id?: string;
  dayOfWeek: string;
  weekOfMonth?: number | null;
  startTime: string;
  endTime?: string | null;
  priceLabel?: string | null;
  hostedBy?: string | null;
  externalUrl?: string | null;
  translations: { title: string; summary?: string | null }[];
};

const DAY_ORDER: Record<string, number> = {
  MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4,
  FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
};

const DAY_FR: Record<string, string> = {
  MONDAY: 'LUN', TUESDAY: 'MAR', WEDNESDAY: 'MER', THURSDAY: 'JEU',
  FRIDAY: 'VEN', SATURDAY: 'SAM', SUNDAY: 'DIM',
};

const FALLBACK_EVENTS: RecurringEvent[] = [
  { dayOfWeek: 'MONDAY',    startTime: '20:00', endTime: '03:00', priceLabel: '12€', hostedBy: null, translations: [{ title: 'Lundi Bear', summary: 'Soirée bears & chaseurs. Ambiance détendue.' }] },
  { dayOfWeek: 'TUESDAY',   startTime: '20:00', endTime: '03:00', priceLabel: '10€', hostedBy: null, translations: [{ title: 'Nasty Boys', summary: 'Soirée -26 ans. Tarif réduit toute la nuit.' }] },
  { dayOfWeek: 'WEDNESDAY', startTime: '18:00', endTime: '03:00', priceLabel: '14€', hostedBy: 'Dj SET', translations: [{ title: 'Mercredi Fetish', summary: 'Code vestimentaire fetish encouraged. DJ set 22h.' }] },
  { dayOfWeek: 'THURSDAY',  startTime: '18:00', endTime: '03:00', priceLabel: '14€', hostedBy: null, translations: [{ title: 'Jeudi Muscu', summary: 'Happy hour salle de sport. -20% sur l\'entrée.' }] },
  { dayOfWeek: 'FRIDAY',    startTime: '18:00', endTime: '06:00', priceLabel: '18€', hostedBy: 'RESIDENT_DJS', translations: [{ title: 'FRIDAY NIGHT', summary: 'Nuit complète. DJ résident. Terrasse ouverte.' }] },
  { dayOfWeek: 'SATURDAY',  startTime: '14:00', endTime: '06:00', priceLabel: '22€', hostedBy: 'LIVE_SET', translations: [{ title: 'SATURDAY MEGA', summary: 'La nuit la plus longue. Live set + DJ. Jusqu\'à 6h.' }] },
  { dayOfWeek: 'SUNDAY',    startTime: '12:00', endTime: '03:00', priceLabel: '14€', hostedBy: null, translations: [{ title: 'Dimanche Relax', summary: 'Ambiance tranquille. Hammam + piscine prioritaires.' }] },
];

function EventRow({ event, idx }: { event: RecurringEvent; idx: number }) {
  const t = event.translations[0];
  const title = t?.title ?? 'EVENT';
  const summary = t?.summary ?? '';
  const day = DAY_FR[event.dayOfWeek] ?? event.dayOfWeek.slice(0, 3);
  const isFriSat = event.dayOfWeek === 'FRIDAY' || event.dayOfWeek === 'SATURDAY';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 80px 1fr auto auto',
        gap: 0,
        alignItems: 'stretch',
        borderBottom: `1px solid ${V2.green}18`,
        background: isFriSat ? `${V2.green}06` : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {/* Day */}
      <div
        style={{
          borderRight: `1px solid ${V2.green}22`,
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isFriSat ? `${V2.green}10` : 'transparent',
        }}
      >
        <MonoText size={11} weight={700} color={isFriSat ? V2.green : V2.green} style={{ opacity: isFriSat ? 1 : 0.5 }}>
          {day}
        </MonoText>
      </div>

      {/* Time */}
      <div
        style={{
          borderRight: `1px solid ${V2.green}22`,
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div>
          <MonoText size={11} weight={700} color={V2.green}>
            {event.startTime}
          </MonoText>
          {event.endTime && (
            <MonoText size={9} color={V2.green} style={{ opacity: 0.4, display: 'block' }}>
              →{event.endTime}
            </MonoText>
          )}
        </div>
      </div>

      {/* Title + summary */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        <MonoText size={13} weight={700} color={V2.green}>
          {title}
        </MonoText>
        {summary && (
          <MonoText size={9} color={V2.green} style={{ opacity: 0.5 }}>
            {summary}
          </MonoText>
        )}
        {event.hostedBy && (
          <MonoText size={8} color={V2.green} style={{ opacity: 0.4, marginTop: 2 }}>
            [HOST:{event.hostedBy}]
          </MonoText>
        )}
      </div>

      {/* Price */}
      <div
        style={{
          borderLeft: `1px solid ${V2.green}22`,
          padding: '20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {event.priceLabel && (
          <MonoText size={14} weight={700} color={V2.green}>
            {event.priceLabel}
          </MonoText>
        )}
      </div>

      {/* External link */}
      <div
        style={{
          borderLeft: `1px solid ${V2.green}22`,
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 48,
        }}
      >
        {event.externalUrl ? (
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: V2.black,
              background: V2.green,
              padding: '4px 8px',
              textDecoration: 'none',
              letterSpacing: '0.1em',
            }}
          >
            →
          </a>
        ) : (
          <MonoText size={9} color={V2.green} style={{ opacity: 0.2 }}>--</MonoText>
        )}
      </div>
    </div>
  );
}

export default function V2Agenda({ events }: { events: RecurringEvent[] }) {
  const displayEvents =
    events.length > 0
      ? [...events].sort((a, b) => (DAY_ORDER[a.dayOfWeek] ?? 8) - (DAY_ORDER[b.dayOfWeek] ?? 8))
      : FALLBACK_EVENTS;

  return (
    <section
      id="agenda"
      style={{
        background: V2.black,
        padding: '96px 40px',
        borderTop: `1px solid ${V2.green}22`,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader
          index="03"
          title="AGENDA_HEBDOMADAIRE"
          subtitle="Programmation récurrente // mise à jour chaque semaine"
        />

        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 80px 1fr auto auto',
            gap: 0,
            borderBottom: `1px solid ${V2.green}44`,
            marginBottom: 0,
          }}
        >
          {['JOUR', 'HORAIRE', 'ÉVÉNEMENT', 'PRIX', 'TICKET'].map((h) => (
            <div key={h} style={{ padding: '10px 16px', borderRight: `1px solid ${V2.green}22` }}>
              <MonoText size={8} color={V2.green} style={{ opacity: 0.4 }}>{h}</MonoText>
            </div>
          ))}
        </div>

        {/* Event rows */}
        <div style={{ border: `1px solid ${V2.green}22`, borderTop: 'none' }}>
          {displayEvents.map((event, i) => (
            <EventRow key={event.id ?? i} event={event} idx={i} />
          ))}
        </div>

        {/* Footer note */}
        <div
          style={{
            marginTop: 24,
            padding: '12px 20px',
            border: `1px solid ${V2.green}18`,
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <MonoText size={9} color={V2.green} style={{ opacity: 0.4 }}>
            ⚡ Programmation susceptible d'être modifiée. Vérifier sur nos réseaux.
          </MonoText>
          <MonoText size={9} color={V2.green} style={{ opacity: 0.4 }}>
            Réservation en ligne conseillée VEN+SAM.
          </MonoText>
        </div>
      </div>
    </section>
  );
}
