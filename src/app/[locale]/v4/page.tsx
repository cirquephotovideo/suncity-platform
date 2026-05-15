import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import V4Nav from '@/components/v4/V4Nav';
import V4Hero from '@/components/v4/V4Hero';
import V4Strip from '@/components/v4/V4Strip';
import V4Zones from '@/components/v4/V4Zones';
import V4Agenda from '@/components/v4/V4Agenda';
import V4Pricing from '@/components/v4/V4Pricing';
import V4Footer from '@/components/v4/V4Footer';

// ─── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === 'fr';
  return {
    title: isFr
      ? 'Sun City Paris — Sauna Gay · Moon Daydream'
      : 'Sun City Paris — Gay Sauna · Moon Daydream',
    description: isFr
      ? 'Le plus grand sauna gay de Paris. 3 000 m², 3 étages, soirées thématiques chaque soir.'
      : 'The largest gay sauna in Paris. 3,000 sqm, 3 floors, themed nights every evening.',
    robots: { index: true, follow: true },
  };
}

// ─── Data fetchers ────────────────────────────────────────────────────────────
async function getLocations(locale: 'fr' | 'en') {
  return prisma.location
    .findMany({
      where: { active: true },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        slug: true,
        iconKey: true,
        coverImageUrl: true,
        translations: {
          where: { locale },
          select: { title: true, summary: true, contentMd: true },
        },
      },
    })
    .catch(() => []);
}

async function getRecurringEvents(locale: 'fr' | 'en') {
  return prisma.recurringEvent
    .findMany({
      where: { active: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      select: {
        dayOfWeek: true,
        weekOfMonth: true,
        startTime: true,
        endTime: true,
        priceLabel: true,
        hostedBy: true,
        externalUrl: true,
        translations: {
          where: { locale },
          select: { title: true, summary: true },
        },
      },
    })
    .catch(() => []);
}

async function getTariffs(locale: 'fr' | 'en') {
  return prisma.tariff
    .findMany({
      where: { active: true },
      orderBy: { orderIndex: 'asc' },
      select: {
        code: true,
        priceCents: true,
        daysApplicable: true,
        conditionLabel: true,
        translations: {
          where: { locale },
          select: { label: true, details: true },
        },
      },
    })
    .catch(() => []);
}

async function getSiteSettings() {
  return prisma.siteSettings
    .findUnique({ where: { id: 1 } })
    .catch(() => null);
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function V4Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const safeLocale: 'fr' | 'en' = locale === 'en' ? 'en' : 'fr';

  // Fetch en parallèle
  const [locations, recurringEvents, tariffs, settings] = await Promise.all([
    getLocations(safeLocale),
    getRecurringEvents(safeLocale),
    getTariffs(safeLocale),
    getSiteSettings(),
  ]);

  const coverImageUrl =
    locations.find((l) => l.coverImageUrl)?.coverImageUrl ??
    (settings as any)?.coverImageUrl ??
    null;

  const siteName = (settings as any)?.siteName ?? 'Sun City';

  return (
    <>
      {/* Navigation fixe */}
      <V4Nav locale={locale} siteName={siteName} />

      {/* Hero plein écran */}
      <V4Hero
        locale={locale}
        coverImageUrl={coverImageUrl}
        siteName={siteName}
        tagline={(settings as any)?.tagline ?? null}
      />

      {/* Strip défilant */}
      <V4Strip locale={locale} />

      {/* Zones / espaces */}
      <V4Zones locale={locale} locations={locations as any} />

      {/* Agenda récurrent */}
      <V4Agenda locale={locale} events={recurringEvents as any} />

      {/* Tarifs */}
      <V4Pricing locale={locale} tariffs={tariffs as any} />

      {/* Footer */}
      <V4Footer locale={locale} settings={settings as any} />
    </>
  );
}
