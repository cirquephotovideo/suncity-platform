import { getTranslations, setRequestLocale } from 'next-intl/server';
import ContactForm from '@/components/ContactForm';
import { PageHero } from '@/components/PageHero';
import { prisma } from '@/lib/prisma';
import { Phone, MapPin, Mail } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return { title: `${t('title')} — Sun City Paris`, description: t('intro') };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const tSite = await getTranslations('site');
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  return (
    <section className="section">
      <PageHero eyebrow="Sun City" title={t('title')} subtitle={t('intro')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ContactForm />
        <div className="bg-bgAlt border border-border rounded-lg p-6">
          <h2 className="font-display text-xl mb-4">{t('directContact')}</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><Phone className="w-4 h-4 text-primary mt-1" /><a href={`tel:${(settings?.contactPhone ?? tSite('phone')).replace(/\s/g, '')}`}>{settings?.contactPhone ?? tSite('phone')}</a></li>
            <li className="flex items-start gap-3"><Mail className="w-4 h-4 text-primary mt-1" /><a href={`mailto:${settings?.contactEmail ?? 'contact@suncity-paris.fr'}`}>{settings?.contactEmail ?? 'contact@suncity-paris.fr'}</a></li>
            <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-primary mt-1" /><span>{settings?.address ?? tSite('address')}</span></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
