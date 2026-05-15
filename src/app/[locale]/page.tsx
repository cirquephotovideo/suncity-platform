import { Link } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/EventCard';
import { LocationCard } from '@/components/LocationCard';
import NewsletterForm from '@/components/NewsletterForm';
import { Clock, MapPin, Phone } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  return { title: `${tSite('name')} — ${t('heroTitle')}`, description: t('heroBody') };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tSite = await getTranslations('site');

  const [locations, recurring, settings] = await Promise.all([
    prisma.location.findMany({
      where: { active: true },
      include: { translations: { where: { locale: locale as any } } },
      orderBy: { orderIndex: 'asc' },
      take: 5,
    }),
    prisma.recurringEvent.findMany({
      where: { active: true },
      include: { translations: { where: { locale: locale as any } } },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="section text-center">
        <p className="eyebrow mb-4">{t('heroEyebrow')}</p>
        <h1 className="font-display text-4xl md:text-6xl mb-6 max-w-4xl mx-auto leading-tight">{t('heroTitle')}</h1>
        <p className="text-lg text-textMuted max-w-2xl mx-auto mb-8">{t('heroBody')}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/agenda" className="btn-primary">{t('heroCtaAgenda')}</Link>
          <Link href="/tarifs" className="btn-outline">{t('heroCtaTariffs')}</Link>
        </div>
      </section>

      {/* Infos pratiques */}
      <section className="section pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bgAlt border border-border rounded-lg p-5 flex items-start gap-4">
          <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold mb-1">{t('openingTitle')}</p>
            <p className="text-sm text-textMuted">{t('openingNote')}</p>
          </div>
        </div>
        <div className="bg-bgAlt border border-border rounded-lg p-5 flex items-start gap-4">
          <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold mb-1">{tSite('addressShort')}</p>
            <p className="text-sm text-textMuted">{settings?.address ?? tSite('address')}</p>
          </div>
        </div>
        <div className="bg-bgAlt border border-border rounded-lg p-5 flex items-start gap-4">
          <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold mb-1">{tSite('phone')}</p>
            <a href={`tel:${(settings?.contactPhone ?? tSite('phone')).replace(/\s/g, '')}`} className="text-sm">{settings?.contactPhone ?? tSite('phone')}</a>
          </div>
        </div>
      </section>

      {/* 5 lieux */}
      <section className="section">
        <h2 className="font-display text-3xl md:text-4xl mb-8">{t('placesTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => {
            const tr = loc.translations[0];
            return tr ? <LocationCard key={loc.id} slug={loc.slug} title={tr.title} summary={tr.summary} iconKey={loc.iconKey} /> : null;
          })}
        </div>
      </section>

      {/* Agenda hebdo */}
      <section className="section">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8">
          <h2 className="font-display text-3xl md:text-4xl">{t('agendaTitle')}</h2>
          <Link href="/agenda" className="text-primary text-sm hover:text-accent">{t('agendaCta')} →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recurring.slice(0, 8).map((r) => {
            const tr = r.translations[0];
            return tr ? (
              <EventCard key={r.id} title={tr.title} summary={tr.summary} dayOfWeek={r.dayOfWeek as any}
                weekOfMonth={r.weekOfMonth as any} startTime={r.startTime} endTime={r.endTime}
                priceLabel={r.priceLabel} hostedBy={r.hostedBy} externalUrl={r.externalUrl} />
            ) : null;
          })}
        </div>
      </section>

      {/* Newsletter */}
      <section className="section">
        <div className="bg-bgAlt border border-border rounded-lg p-8 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl mb-2">{t('newsletterTitle')}</h2>
          <p className="text-textMuted mb-6">{t('newsletterBody')}</p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
