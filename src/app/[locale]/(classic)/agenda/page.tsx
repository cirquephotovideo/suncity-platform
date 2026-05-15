import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/EventCard';
import { PageHero } from '@/components/PageHero';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'agenda' });
  return { title: `${t('title')} — Sun City Paris`, description: t('intro') };
}

export default async function AgendaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('agenda');

  const [recurring, upcoming] = await Promise.all([
    prisma.recurringEvent.findMany({
      where: { active: true },
      include: { translations: { where: { locale: locale as any } } },
      orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
    }),
    prisma.event.findMany({
      where: { status: 'PUBLISHED', startsAt: { gte: new Date() } },
      include: { translations: { where: { locale: locale as any } } },
      orderBy: { startsAt: 'asc' },
      take: 20,
    }),
  ]);

  return (
    <>
      {/* @ts-expect-error async server */}
      <PageHero eyebrow="Sun City" title={t('title')} subtitle={t('intro')} />

      <section className="section pt-0">
        <h2 className="font-display text-2xl mb-6">{t('weekly')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurring.map((r) => {
            const tr = r.translations[0];
            return tr ? (
              <EventCard key={r.id} title={tr.title} summary={tr.summary} dayOfWeek={r.dayOfWeek as any}
                weekOfMonth={r.weekOfMonth as any} startTime={r.startTime} endTime={r.endTime}
                priceLabel={r.priceLabel} hostedBy={r.hostedBy} externalUrl={r.externalUrl} />
            ) : null;
          })}
        </div>
      </section>

      <section className="section pt-0">
        <h2 className="font-display text-2xl mb-6">{t('upcoming')}</h2>
        {upcoming.length === 0 ? (
          <p className="text-textMuted italic">{t('noEvents')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((e) => {
              const tr = e.translations[0];
              return tr ? (
                <EventCard key={e.id} title={tr.title} summary={tr.summary}
                  startTime={e.startsAt.toISOString().slice(11, 16)}
                  externalUrl={e.externalUrl} />
              ) : null;
            })}
          </div>
        )}
      </section>
    </>
  );
}
