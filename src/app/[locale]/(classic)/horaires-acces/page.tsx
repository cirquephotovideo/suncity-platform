import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Clock, MapPin, Phone, Train, Bus, Car } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'schedule' });
  return { title: `${t('title')} — Sun City Paris`, description: t('accessTitle') };
}

export default async function SchedulePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('schedule');
  const tSite = await getTranslations('site');
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const oh = (settings?.openingHoursJson as any) || {};

  const days = [
    ['mon', locale === 'fr' ? 'Lundi' : 'Monday'],
    ['tue', locale === 'fr' ? 'Mardi' : 'Tuesday'],
    ['wed', locale === 'fr' ? 'Mercredi' : 'Wednesday'],
    ['thu', locale === 'fr' ? 'Jeudi' : 'Thursday'],
    ['fri', locale === 'fr' ? 'Vendredi' : 'Friday'],
    ['sat', locale === 'fr' ? 'Samedi' : 'Saturday'],
    ['sun', locale === 'fr' ? 'Dimanche' : 'Sunday'],
  ];

  return (
    <section className="section">
      <p className="eyebrow mb-3">Sun City</p>
      <h1 className="font-display text-4xl md:text-5xl mb-10">{t('title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-bgAlt border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl">{t('openingTitle')}</h2>
          </div>
          <ul className="space-y-2 text-sm">
            {days.map(([k, label]) => (
              <li key={k} className="flex justify-between border-b border-border/50 pb-2">
                <span>{label}</span>
                <span className="text-primary">{oh[k] ?? '—'}</span>
              </li>
            ))}
          </ul>
          {oh.notes && <p className="text-xs text-textMuted mt-4">{oh.notes[locale]}</p>}
        </div>

        <div className="bg-bgAlt border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl">{t('accessTitle')}</h2>
          </div>
          <p className="text-sm mb-4">{settings?.address ?? tSite('address')}</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><Train className="w-4 h-4 text-primary mt-1 flex-shrink-0" /><span>{t('metro')}</span></li>
            <li className="flex items-start gap-3"><Bus className="w-4 h-4 text-primary mt-1 flex-shrink-0" /><span>{t('bus')}</span></li>
            <li className="flex items-start gap-3"><Car className="w-4 h-4 text-primary mt-1 flex-shrink-0" /><span>{t('parking')}</span></li>
            <li className="flex items-start gap-3"><Phone className="w-4 h-4 text-primary mt-1 flex-shrink-0" /><span>{t('phone', { phone: settings?.contactPhone ?? tSite('phone') })}</span></li>
          </ul>
          <div className="mt-6 aspect-video bg-border/20 rounded overflow-hidden">
            <iframe title="Carte" src="https://www.openstreetmap.org/export/embed.html?bbox=2.3500%2C48.8617%2C2.3548%2C48.8645&layer=mapnik&marker=48.8631%2C2.3524" className="w-full h-full border-0" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}
