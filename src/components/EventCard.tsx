import { useTranslations } from 'next-intl';

type Day = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
type WoM = 'ALL' | 'ODD' | 'EVEN' | 'W1' | 'W2' | 'W3' | 'W4' | 'W5';

export interface EventCardProps {
  title: string;
  summary?: string | null;
  dayOfWeek?: Day;
  weekOfMonth?: WoM;
  startTime?: string;
  endTime?: string | null;
  priceLabel?: string | null;
  hostedBy?: string | null;
  externalUrl?: string | null;
}

export function EventCard(p: EventCardProps) {
  const tDay = useTranslations('days');
  const tWom = useTranslations('weekOfMonth');
  const tAg = useTranslations('agenda');

  const dayLabel = p.dayOfWeek ? tDay(p.dayOfWeek) : '';
  const womLabel = p.weekOfMonth && p.weekOfMonth !== 'ALL' ? tWom(p.weekOfMonth, { day: dayLabel }) : '';

  return (
    <article className="bg-bgAlt border border-border rounded-lg p-5 hover:border-primary/60 transition">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <p className="eyebrow">{womLabel || dayLabel}</p>
        {p.priceLabel && <span className="text-primary text-sm font-semibold">{p.priceLabel}</span>}
      </div>
      <h3 className="font-display text-xl mb-2">{p.title}</h3>
      {p.startTime && <p className="text-sm text-textMuted mb-2">{tAg('from')} {p.startTime}{p.endTime ? ` — ${p.endTime}` : ''}</p>}
      {p.summary && <p className="text-sm text-textMuted leading-relaxed">{p.summary}</p>}
      {p.hostedBy && <p className="text-xs text-textMuted mt-3 italic">{tAg('hostedBy')} {p.hostedBy}</p>}
      {p.externalUrl && (
        <a href={p.externalUrl} rel="noopener noreferrer" className="inline-block mt-3 text-sm text-primary hover:text-accent">
          {tAg('moreInfo')} →
        </a>
      )}
    </article>
  );
}
