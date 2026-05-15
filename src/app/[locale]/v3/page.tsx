import { setRequestLocale } from 'next-intl/server';
import { V3Nav } from '@/components/v3/V3Nav';
import { V3Hero } from '@/components/v3/V3Hero';
import { V3Strip } from '@/components/v3/V3Strip';
import { V3Zones } from '@/components/v3/V3Zones';
import { V3Agenda } from '@/components/v3/V3Agenda';
import { V3Pricing } from '@/components/v3/V3Pricing';
import { V3Footer } from '@/components/v3/V3Footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: 'Sun City — Y2K Chrome Cruise',
    description: locale === 'fr'
      ? 'Le plus grand sauna gay de Paris. 3000 m². 3 étages. Zero filter.'
      : 'Paris\' largest gay sauna. 3000 sqm. 3 floors. Zero filter.',
  };
}

export default async function V3Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <V3Nav />
      <V3Hero />
      <V3Strip />
      <V3Zones locale={locale} />
      <V3Agenda locale={locale} />
      <V3Pricing locale={locale} />
      <V3Footer />
    </>
  );
}
