'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import { translate } from '@/lib/ai-provider';

// ── Pages ─────────────────────────────────────────────────

export async function translatePage(id: string) {
  const actorId = await requireAdminUserId();
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) throw new Error('Page not found');

  const textToTranslate = [page.title, page.excerpt ?? '', page.contentHtml ?? '']
    .filter(Boolean)
    .join('\n\n---\n\n');
  const result = await translate(textToTranslate, page.locale, page.locale === 'fr' ? 'en' : 'fr');
  if (!result.ok) throw new Error(result.error ?? 'AI translation failed');

  const targetLocale = page.locale === 'fr' ? 'en' : 'fr';
  await prisma.page.upsert({
    where: { slug_locale: { slug: page.slug, locale: targetLocale } },
    update: { title: `[AI] ${page.title}`, contentHtml: result.text, status: 'DRAFT' },
    create: {
      slug: page.slug,
      locale: targetLocale,
      title: `[AI] ${page.title}`,
      contentHtml: result.text,
      status: 'DRAFT',
    },
  });

  await audit({ actorId, action: 'CREATE', targetType: 'Page', targetId: id, diff: { aiTranslation: true, targetLocale } });
  revalidatePath('/admin/translations');
  revalidatePath('/admin/pages');
}

// ── Locations ─────────────────────────────────────────────

export async function translateLocation(id: string) {
  const actorId = await requireAdminUserId();
  const loc = await prisma.location.findUnique({
    where: { id },
    include: { translations: { where: { locale: 'fr' } } },
  });
  if (!loc) throw new Error('Location not found');
  const frTr = loc.translations[0];
  if (!frTr) throw new Error('No FR translation to translate from');

  const textToTranslate = `${frTr.title}\n\n${frTr.summary}\n\n${frTr.contentMd}`;
  const result = await translate(textToTranslate, 'fr', 'en');
  if (!result.ok) throw new Error(result.error ?? 'AI translation failed');

  // Best-effort: store entire translated block as contentMd for EN
  await prisma.locationTranslation.upsert({
    where: { locationId_locale: { locationId: id, locale: 'en' } },
    update: { title: `[AI] ${frTr.title}`, summary: '', contentMd: result.text },
    create: { locationId: id, locale: 'en', title: `[AI] ${frTr.title}`, summary: '', contentMd: result.text },
  });

  await audit({ actorId, action: 'UPDATE', targetType: 'Location', targetId: id, diff: { aiTranslation: true } });
  revalidatePath('/admin/translations');
  revalidatePath('/admin/lieux');
}

// ── Events ────────────────────────────────────────────────

export async function translateEvent(id: string) {
  const actorId = await requireAdminUserId();
  const event = await prisma.event.findUnique({
    where: { id },
    include: { translations: { where: { locale: 'fr' } } },
  });
  if (!event) throw new Error('Event not found');
  const frTr = event.translations[0];
  if (!frTr) throw new Error('No FR translation to translate from');

  const textToTranslate = `${frTr.title}\n\n${frTr.summary ?? ''}\n\n${frTr.contentMd ?? ''}`;
  const result = await translate(textToTranslate, 'fr', 'en');
  if (!result.ok) throw new Error(result.error ?? 'AI translation failed');

  await prisma.eventTranslation.upsert({
    where: { eventId_locale: { eventId: id, locale: 'en' } },
    update: { title: `[AI] ${frTr.title}`, summary: result.text.slice(0, 500) },
    create: { eventId: id, locale: 'en', title: `[AI] ${frTr.title}`, summary: result.text.slice(0, 500) },
  });

  await audit({ actorId, action: 'UPDATE', targetType: 'Event', targetId: id, diff: { aiTranslation: true } });
  revalidatePath('/admin/translations');
  revalidatePath('/admin/agenda');
}
