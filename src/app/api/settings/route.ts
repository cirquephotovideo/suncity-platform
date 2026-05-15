import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false as const, status: 401, error: 'unauthorized' };
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN' && role !== 'EDITOR') return { ok: false as const, status: 403, error: 'forbidden' };
  return { ok: true as const, userId: (session.user as { id: string }).id };
}

const SECRET_FIELDS = new Set(['resendApiKey', 'telegramBotToken']);

function sanitize(s: any) {
  if (!s) return null;
  const { resendApiKey, telegramBotToken, ...rest } = s;
  return {
    ...rest,
    resendApiKeySet: !!resendApiKey,
    telegramBotTokenSet: !!telegramBotToken,
  };
}

export async function GET() {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return NextResponse.json({ ok: true, settings: sanitize(s) });
}

export async function PATCH(req: NextRequest) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const body = await req.json().catch(() => ({}));

  const allowed: Record<string, any> = {};
  const stringFields = [
    'siteName', 'baseline_fr', 'baseline_en', 'timezone', 'currency',
    'contactPhone', 'contactEmail', 'address', 'rcs',
    'seoTitle', 'seoDescription', 'ogImageUrl', 'gaId', 'plausibleDomain', 'schemaOrgType',
    'themeKey', 'stripePublicKey', 'minioBucket',
    'mailSenderName', 'mailSenderEmail', 'mailFooterFr', 'mailFooterEn', 'consentText',
    'footerHtmlFr', 'footerHtmlEn', 'copyrightText',
  ];
  for (const k of stringFields) {
    if (k in body) allowed[k] = body[k] === '' ? null : (body[k] ?? null);
  }
  // Secrets — only write if non-empty (so you can't accidentally clear by reload)
  for (const k of SECRET_FIELDS) {
    if (k in body && typeof body[k] === 'string' && body[k].length > 0) {
      allowed[k] = body[k];
    }
  }
  if ('defaultLocale' in body) allowed.defaultLocale = body.defaultLocale === 'en' ? 'en' : 'fr';
  if ('ageGateEnabled' in body) allowed.ageGateEnabled = !!body.ageGateEnabled;
  if ('ageGateMinAge' in body) allowed.ageGateMinAge = Number(body.ageGateMinAge) || 18;
  if ('robotsNoIndex' in body) allowed.robotsNoIndex = !!body.robotsNoIndex;
  if ('doubleOptIn' in body) allowed.doubleOptIn = !!body.doubleOptIn;
  if ('latitude' in body) allowed.latitude = body.latitude === null || body.latitude === '' ? null : Number(body.latitude);
  if ('longitude' in body) allowed.longitude = body.longitude === null || body.longitude === '' ? null : Number(body.longitude);
  if ('openingHoursJson' in body) allowed.openingHoursJson = body.openingHoursJson ?? null;
  if ('socialJson' in body) allowed.socialJson = body.socialJson ?? null;
  if ('partnersJson' in body) allowed.partnersJson = body.partnersJson ?? null;
  if ('legalLinksJson' in body) allowed.legalLinksJson = body.legalLinksJson ?? null;

  const updated = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: allowed,
    create: { id: 1, ...allowed },
  });

  // Strip secrets from audit diff
  const { resendApiKey, telegramBotToken, ...auditDiff } = allowed;
  await audit({
    actorId: a.userId, action: 'UPDATE', targetType: 'SiteSettings', targetId: '1',
    diff: { fields: Object.keys(auditDiff), tab: body.tab ?? null },
  });

  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, settings: sanitize(updated) });
}
