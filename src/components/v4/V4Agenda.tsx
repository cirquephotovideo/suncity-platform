import { V4, EditorialText, MonoLabel, MoonPattern } from './V4Atoms';

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
type WeekOfMonth = 'ALL' | 'ODD' | 'EVEN' | 'W1' | 'W2' | 'W3' | 'W4' | 'W5';

interface RecurringEvent {
  dayOfWeek: DayOfWeek;
  weekOfMonth: WeekOfMonth;
  startTime: string;
  endTime: string;
  priceLabel: string | null;
  hostedBy: string | null;
  externalUrl: string | null;
  translations: { title: string; summary: string | null }[];
}

interface V4AgendaProps {
  locale: string;
  events: RecurringEvent[];
}

const DAY_ORDER: DayOfWeek[] = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

const DAY_FR: Record<DayOfWeek, string> = {
  MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mer', THURSDAY: 'Jeu',
  FRIDAY: 'Ven', SATURDAY: 'Sam', SUNDAY: 'Dim',
};
const DAY_EN: Record<DayOfWeek, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};
const DAY_FULL_FR: Record<DayOfWeek, string> = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi', THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};
const DAY_FULL_EN: Record<DayOfWeek, string> = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday',
  FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
};

function formatTime(t: string) {
  return t.slice(0, 5).replace(':', 'h');
}

function weekLabel(w: WeekOfMonth, isFr: boolean): string {
  if (w === 'ALL') return '';
  if (w === 'ODD') return isFr ? '(sem. impaires)' : '(odd weeks)';
  if (w === 'EVEN') return isFr ? '(sem. paires)' : '(even weeks)';
  return `(${w})`;
}

// Regrouper par jour
function groupByDay(events: RecurringEvent[]) {
  const map = new Map<DayOfWeek, RecurringEvent[]>();
  for (const e of events) {
    if (!map.has(e.dayOfWeek)) map.set(e.dayOfWeek, []);
    map.get(e.dayOfWeek)!.push(e);
  }
  return map;
}

export default function V4Agenda({ locale, events }: V4AgendaProps) {
  const isFr = locale === 'fr';
  const grouped = groupByDay(events);

  const days = DAY_ORDER.filter((d) => grouped.has(d));

  return (
    <section
      id="agenda"
      style={{
        background: V4.cream,
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 60px',
      }}
    >
      <MoonPattern size={200} color={V4.night} opacity={0.04} id="agenda-moon" />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 72 }}>
          <MonoLabel size={10} color={`${V4.accent}70`} style={{ marginBottom: 24, display: 'block' }}>
            {isFr ? 'Programme de la semaine' : 'Weekly schedule'}
          </MonoLabel>
          <EditorialText size={64} color={V4.night} style={{ display: 'block' }}>
            {isFr ? 'Agenda' : 'Schedule'}
          </EditorialText>
          <EditorialText
            size={64}
            color={V4.accent}
            style={{
              display: 'block',
              fontStyle: 'italic',
              fontVariationSettings: '"opsz" 144, "WONK" 1, "SOFT" 100',
            }}
          >
            {isFr ? 'récurrent.' : 'recurring.'}
          </EditorialText>
        </div>

        {/* Jours */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {days.length === 0
            ? FALLBACK_AGENDA(isFr).map((row, i) => (
                <AgendaRow key={i} row={row} index={i} isFr={isFr} />
              ))
            : days.map((day, i) => {
                const evs = grouped.get(day)!;
                return evs.map((ev, j) => {
                  const t = ev.translations[0];
                  return (
                    <AgendaRow
                      key={`${day}-${j}`}
                      index={i}
                      isFr={isFr}
                      row={{
                        dayShort: isFr ? DAY_FR[day] : DAY_EN[day],
                        dayFull: isFr ? DAY_FULL_FR[day] : DAY_FULL_EN[day],
                        time: `${formatTime(ev.startTime)} → ${formatTime(ev.endTime)}`,
                        title: t?.title ?? '—',
                        summary: t?.summary ?? '',
                        price: ev.priceLabel ?? '',
                        host: ev.hostedBy ?? '',
                        week: weekLabel(ev.weekOfMonth, isFr),
                        href: ev.externalUrl ?? undefined,
                      }}
                    />
                  );
                });
              })}
        </div>
      </div>
    </section>
  );
}

interface AgendaRowData {
  dayShort: string;
  dayFull: string;
  time: string;
  title: string;
  summary?: string;
  price?: string;
  host?: string;
  week?: string;
  href?: string;
}

function AgendaRow({
  row,
  index,
  isFr,
}: {
  row: AgendaRowData;
  index: number;
  isFr: boolean;
}) {
  const isEven = index % 2 === 0;
  const content = (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr auto',
        gap: '0 40px',
        alignItems: 'center',
        padding: '28px 40px',
        background: isEven ? V4.mist : V4.cream,
        borderBottom: `1px solid ${V4.night}08`,
        cursor: row.href ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
    >
      {/* Jour */}
      <div>
        <MonoLabel size={10} color={V4.accent}>
          {row.dayShort}{row.week ? ` ${row.week}` : ''}
        </MonoLabel>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: `${V4.night}40`,
            marginTop: 4,
          }}
        >
          {row.time}
        </div>
      </div>

      {/* Titre + résumé */}
      <div>
        <div
          style={{
            fontFamily: "'Fraunces', 'Playfair Display', serif",
            fontVariationSettings: '"opsz" 72, "WONK" 0, "SOFT" 60',
            fontSize: 22,
            fontWeight: 300,
            color: V4.night,
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          {row.title}
        </div>
        {row.host && (
          <MonoLabel size={10} color={`${V4.accent}60`} style={{ marginTop: 6, display: 'block' }}>
            {isFr ? 'Animé par' : 'Hosted by'} {row.host}
          </MonoLabel>
        )}
      </div>

      {/* Prix */}
      {row.price && (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            color: V4.accent,
            textAlign: 'right',
            whiteSpace: 'nowrap',
          }}
        >
          {row.price}
        </div>
      )}
    </div>
  );

  return row.href ? (
    <a href={row.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      {content}
    </a>
  ) : content;
}

function FALLBACK_AGENDA(isFr: boolean): AgendaRowData[] {
  return [
    { dayShort: isFr ? 'Lun' : 'Mon', dayFull: isFr ? 'Lundi' : 'Monday', time: '12h00 → 01h00', title: isFr ? 'Ouverture classique' : 'Classic opening', price: isFr ? 'À partir de 9€' : 'From €9' },
    { dayShort: isFr ? 'Mar' : 'Tue', dayFull: isFr ? 'Mardi' : 'Tuesday', time: '12h00 → 01h00', title: isFr ? 'Nasty Boys — 26 ans & moins' : 'Nasty Boys — 26 & under', price: '10€' },
    { dayShort: isFr ? 'Mer' : 'Wed', dayFull: isFr ? 'Mercredi' : 'Wednesday', time: '12h00 → 01h00', title: isFr ? 'Soirée Bears & Chubs' : 'Bears & Chubs night', price: isFr ? 'Tarif standard' : 'Standard rate' },
    { dayShort: isFr ? 'Jeu' : 'Thu', dayFull: isFr ? 'Jeudi' : 'Thursday', time: '12h00 → 02h00', title: isFr ? 'Soirée Fetish & Cuir' : 'Fetish & Leather night', price: '15€' },
    { dayShort: isFr ? 'Ven' : 'Fri', dayFull: isFr ? 'Vendredi' : 'Friday', time: '12h00 → 06h00', title: isFr ? 'Weekend Opening — all night' : 'Weekend Opening — all night', price: '18€' },
    { dayShort: isFr ? 'Sam' : 'Sat', dayFull: isFr ? 'Samedi' : 'Saturday', time: '12h00 → 06h00', title: isFr ? 'Sun City Saturday' : 'Sun City Saturday', price: '20€' },
    { dayShort: isFr ? 'Dim' : 'Sun', dayFull: isFr ? 'Dimanche' : 'Sunday', time: '12h00 → 00h00', title: isFr ? 'Dimanche Détente' : 'Relaxation Sunday', price: '12€' },
  ];
}
