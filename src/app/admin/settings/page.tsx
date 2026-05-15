import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import SettingsForm from '@/components/admin/SettingsForm';
import { SKINS, SKIN_KEYS } from '@/lib/skins';

export const metadata = { title: 'Paramètres — Sun City Admin' };

export default async function SettingsPage() {
  await requireAdmin();
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  // Sanitize: strip secrets, expose only "set" booleans
  const initial = s ? {
    siteName: s.siteName ?? null,
    baseline_fr: s.baseline_fr ?? null,
    baseline_en: s.baseline_en ?? null,
    defaultLocale: s.defaultLocale,
    timezone: s.timezone ?? 'Europe/Paris',
    currency: s.currency ?? 'EUR',
    ageGateEnabled: s.ageGateEnabled,
    ageGateMinAge: s.ageGateMinAge,
    contactPhone: s.contactPhone ?? null,
    contactEmail: s.contactEmail ?? null,
    address: s.address ?? null,
    rcs: s.rcs ?? null,
    latitude: s.latitude ?? null,
    longitude: s.longitude ?? null,
    openingHoursJson: s.openingHoursJson ?? {},
    socialJson: s.socialJson ?? {},
    seoTitle: s.seoTitle ?? null,
    seoDescription: s.seoDescription ?? null,
    ogImageUrl: s.ogImageUrl ?? null,
    robotsNoIndex: s.robotsNoIndex,
    gaId: s.gaId ?? null,
    plausibleDomain: s.plausibleDomain ?? null,
    schemaOrgType: s.schemaOrgType ?? null,
    themeKey: s.themeKey ?? 'sun',
    stripePublicKey: s.stripePublicKey ?? null,
    minioBucket: s.minioBucket ?? null,
    resendApiKeySet: !!s.resendApiKey,
    telegramBotTokenSet: !!s.telegramBotToken,
    mailSenderName: s.mailSenderName ?? null,
    mailSenderEmail: s.mailSenderEmail ?? null,
    mailFooterFr: s.mailFooterFr ?? null,
    mailFooterEn: s.mailFooterEn ?? null,
    doubleOptIn: s.doubleOptIn,
    consentText: s.consentText ?? null,
    footerHtmlFr: s.footerHtmlFr ?? null,
    footerHtmlEn: s.footerHtmlEn ?? null,
    copyrightText: s.copyrightText ?? null,
    legalLinksJson: s.legalLinksJson ?? [],
  } : {
    defaultLocale: 'fr' as const,
    timezone: 'Europe/Paris',
    currency: 'EUR',
    ageGateEnabled: true,
    ageGateMinAge: 18,
    themeKey: 'sun',
    robotsNoIndex: false,
    doubleOptIn: true,
    openingHoursJson: {},
    socialJson: {},
    legalLinksJson: [],
    resendApiKeySet: false,
    telegramBotTokenSet: false,
  };

  const themeOptions = SKIN_KEYS.map(k => ({ key: k, label: SKINS[k].label }));

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl mb-6">Paramètres du site</h1>
      <SettingsForm initial={initial as any} themeOptions={themeOptions} />
    </div>
  );
}
