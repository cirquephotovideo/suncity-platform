import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { prisma } from '@/lib/prisma';
import V2Nav from '@/components/v2/V2Nav';
import V2Hero from '@/components/v2/V2Hero';
import V2Strip from '@/components/v2/V2Strip';
import V2Zones from '@/components/v2/V2Zones';
import V2Agenda from '@/components/v2/V2Agenda';
import V2Pricing from '@/components/v2/V2Pricing';
import V2Footer from '@/components/v2/V2Footer';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function V2Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const loc = locale as 'fr' | 'en';

  // ── Data fetching (toutes les requêtes en parallèle) ──────────────────────
  const [locations, recurringEvents, tariffs, siteSettings] = await Promise.all([
    prisma.location
      .findMany({
        where: { active: true },
        include: {
          translations: { where: { locale: loc } },
        },
        orderBy: { orderIndex: 'asc' },
      })
      .catch(() => []),

    prisma.recurringEvent
      .findMany({
        include: {
          translations: { where: { locale: loc } },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      })
      .catch(() => []),

    prisma.tariff
      .findMany({
        include: {
          translations: { where: { locale: loc } },
        },
        orderBy: { priceCents: 'asc' },
      })
      .catch(() => []),

    prisma.siteSettings
      .findUnique({ where: { id: 1 } })
      .catch(() => null),
  ]);

  // ── Normalise shape pour les composants ──────────────────────────────────
  const zones = locations.map((l: any) => ({
    id: l.id,
    slug: l.slug,
    iconKey: l.iconKey,
    coverImageUrl: l.coverImageUrl ?? null,
    translations: l.translations.map((t: any) => ({
      title: t.title ?? '',
      summary: t.summary ?? null,
      contentMd: t.contentMd ?? null,
    })),
  }));

  const events = recurringEvents.map((e: any) => ({
    id: e.id,
    dayOfWeek: e.dayOfWeek as string,
    weekOfMonth: e.weekOfMonth ?? null,
    startTime: e.startTime,
    endTime: e.endTime ?? null,
    priceLabel: e.priceLabel ?? null,
    hostedBy: e.hostedBy ?? null,
    externalUrl: e.externalUrl ?? null,
    translations: e.translations.map((t: any) => ({
      title: t.title ?? '',
      summary: t.summary ?? null,
    })),
  }));

  const tariffList = tariffs.map((t: any) => ({
    id: t.id,
    code: t.code,
    priceCents: t.priceCents,
    daysApplicable: t.daysApplicable ?? [],
    conditionLabel: t.conditionLabel ?? null,
    translations: t.translations.map((tr: any) => ({
      label: tr.label ?? '',
      details: tr.details ?? null,
    })),
  }));

  return (
    <>
      {/* Navigation fixe */}
      <V2Nav locale={locale} />

      {/* Hero plein écran */}
      <V2Hero
        siteName="SUN CITY"
        tagline="LE PLUS GRAND SAUNA GAY DE PARIS"
      />

      {/* Strip scrolling */}
      <V2Strip />

      {/* 5 zones — blueprints schématiques */}
      <V2Zones zones={zones} />

      {/* Agenda hebdomadaire */}
      <V2Agenda events={events} />

      {/* Tarifs */}
      <V2Pricing tariffs={tariffList} />

      {/* Footer */}
      <V2Footer settings={siteSettings} />
    </>
  );
}
