import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { V1Nav }     from '@/components/v1/V1Nav';
import { V1Hero }    from '@/components/v1/V1Hero';
import { V1Strip }   from '@/components/v1/V1Strip';
import { V1Zones }   from '@/components/v1/V1Zones';
import { V1Agenda }  from '@/components/v1/V1Agenda';
import { V1Pricing } from '@/components/v1/V1Pricing';
import { V1Footer }  from '@/components/v1/V1Footer';
import type { HeroEventItem } from '@/components/v1/V1HeroEvents';

const DAY_FR: Record<string, string> = {
  MONDAY: 'LUN', TUESDAY: 'MAR', WEDNESDAY: 'MER',
  THURSDAY: 'JEU', FRIDAY: 'VEN', SATURDAY: 'SAM', SUNDAY: 'DIM',
};
const DAY_ORDER = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: 'Sun City — Acid Flyer',
    description: locale === 'fr'
      ? 'Le plus grand sauna gay de Paris. 3000 m². 3 étages. Zero filter.'
      : 'Paris\' largest gay sauna. 3000 sqm. 3 floors. Zero filter.',
  };
}

async function getHeroEvents(locale: string): Promise<HeroEventItem[]> {
  try {
    const recs = await prisma.recurringEvent.findMany({
      where: { active: true },
      include: { translations: { where: { locale: locale as 'fr' | 'en' } } },
      orderBy: { orderIndex: 'asc' },
      take: 8,
    });
    // Sort by day-of-week (today first)
    const todayIdx = (new Date().getDay() + 6) % 7; // 0=MON..6=SUN
    const sorted = [...recs].sort((a, b) => {
      const ai = (DAY_ORDER.indexOf(a.dayOfWeek) - todayIdx + 7) % 7;
      const bi = (DAY_ORDER.indexOf(b.dayOfWeek) - todayIdx + 7) % 7;
      return ai - bi;
    });
    return sorted.map((r, i) => ({
      day: DAY_FR[r.dayOfWeek] ?? r.dayOfWeek.slice(0, 3),
      time: `${r.startTime}${r.endTime ? ` — ${r.endTime}` : ''}`,
      name: r.translations[0]?.title ?? r.slug,
      price: r.priceLabel ?? '18€',
      badge: i === 0 ? 'AUJOURD\'HUI' : undefined,
      accent: (i % 3 === 0 ? 'yellow' : i % 3 === 1 ? 'red' : 'cream') as 'yellow' | 'red' | 'cream',
    }));
  } catch {
    return [];
  }
}

export default async function V1Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const heroEvents = await getHeroEvents(locale);

  return (
    <>
      <V1Nav />
      <V1Hero events={heroEvents} />
      <V1Strip />
      <V1Zones locale={locale} />
      <V1Agenda locale={locale} />
      <V1Pricing locale={locale} />
      <V1Footer />
    </>
  );
}
