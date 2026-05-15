import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { LocationCard } from '@/components/LocationCard';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'places' });
  return { title: `${t('title')} — Sun City Paris`, description: t('intro') };
}

export default async function LocationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('places');

  const locations = await prisma.location.findMany({
    where: { active: true },
    include: { translations: { where: { locale: locale as any } } },
    orderBy: { orderIndex: 'asc' },
  });

  return (
    <>
      <section className="section text-center pb-8">
        <p className="eyebrow mb-3">Sun City</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">{t('title')}</h1>
        <p className="text-textMuted max-w-2xl mx-auto">{t('intro')}</p>
      </section>

      <section className="section pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => {
            const tr = loc.translations[0];
            return tr ? <LocationCard key={loc.id} slug={loc.slug} title={tr.title} summary={tr.summary} iconKey={loc.iconKey} /> : null;
          })}
        </div>
      </section>
    </>
  );
}
