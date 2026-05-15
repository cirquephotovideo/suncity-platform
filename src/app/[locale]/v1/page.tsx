import { setRequestLocale } from 'next-intl/server';
import { V1Nav }     from '@/components/v1/V1Nav';
import { V1Hero }    from '@/components/v1/V1Hero';
import { V1Strip }   from '@/components/v1/V1Strip';
import { V1Zones }   from '@/components/v1/V1Zones';
import { V1Agenda }  from '@/components/v1/V1Agenda';
import { V1Pricing } from '@/components/v1/V1Pricing';
import { V1Footer }  from '@/components/v1/V1Footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: 'Sun City — Acid Flyer',
    description: locale === 'fr'
      ? 'Le plus grand sauna gay de Paris. 3000 m². 3 étages. Zero filter.'
      : 'Paris\' largest gay sauna. 3000 sqm. 3 floors. Zero filter.',
  };
}

export default async function V1Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <V1Nav />
      <V1Hero />
      <V1Strip />
      <V1Zones locale={locale} />
      <V1Agenda locale={locale} />
      <V1Pricing locale={locale} />
      <V1Footer />
    </>
  );
}
