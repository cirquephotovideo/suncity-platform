'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import type { DayOfWeek, WeekOfMonth } from '@prisma/client';

const DAYS: DayOfWeek[] = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] as DayOfWeek[];
const WOMS: WeekOfMonth[] = ['ALL','ODD','EVEN','W1','W2','W3','W4','W5'] as WeekOfMonth[];

export async function upsertRecurring(id: string | null, formData: FormData) {
  const userId = await requireAdminUserId();
  const data = {
    slug: String(formData.get('slug') ?? '').trim(),
    dayOfWeek: String(formData.get('dayOfWeek')) as DayOfWeek,
    weekOfMonth: String(formData.get('weekOfMonth')) as WeekOfMonth,
    startTime: String(formData.get('startTime') ?? ''),
    endTime: String(formData.get('endTime') ?? '') || null,
    priceLabel: String(formData.get('priceLabel') ?? '') || null,
    hostedBy: String(formData.get('hostedBy') ?? '') || null,
    externalUrl: String(formData.get('externalUrl') ?? '') || null,
    active: formData.get('active') === 'on',
    orderIndex: Number(formData.get('orderIndex') ?? 0),
  };
  if (!DAYS.includes(data.dayOfWeek) || !WOMS.includes(data.weekOfMonth)) throw new Error('invalid day/week');

  let rec;
  if (id) {
    rec = await prisma.recurringEvent.update({ where: { id }, data });
    await audit({ actorId: userId, action: 'UPDATE', targetType: 'RecurringEvent', targetId: id, diff: data as any });
  } else {
    rec = await prisma.recurringEvent.create({ data });
    await audit({ actorId: userId, action: 'CREATE', targetType: 'RecurringEvent', targetId: rec.id, diff: data as any });
  }

  // Translations FR + EN
  for (const locale of ['fr', 'en'] as const) {
    const title = String(formData.get(`title_${locale}`) ?? '').trim();
    const summary = String(formData.get(`summary_${locale}`) ?? '') || null;
    if (!title) continue;
    await prisma.recurringEventTranslation.upsert({
      where: { recurringEventId_locale: { recurringEventId: rec.id, locale } },
      update: { title, summary },
      create: { recurringEventId: rec.id, locale, title, summary },
    });
  }
  revalidatePath('/admin/agenda');
  return rec.id;
}

export async function deleteRecurring(id: string) {
  const userId = await requireAdminUserId();
  await prisma.recurringEvent.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'RecurringEvent', targetId: id });
  revalidatePath('/admin/agenda');
}

export async function upsertEvent(id: string | null, formData: FormData) {
  const userId = await requireAdminUserId();
  const data = {
    slug: String(formData.get('slug') ?? '').trim(),
    startsAt: new Date(String(formData.get('startsAt'))),
    endsAt: formData.get('endsAt') ? new Date(String(formData.get('endsAt'))) : null,
    status: String(formData.get('status') ?? 'PUBLISHED') as 'DRAFT' | 'PUBLISHED' | 'CANCELLED',
    externalUrl: String(formData.get('externalUrl') ?? '') || null,
    coverImageUrl: String(formData.get('coverImageUrl') ?? '') || null,
  };
  let ev;
  if (id) {
    ev = await prisma.event.update({ where: { id }, data });
    await audit({ actorId: userId, action: 'UPDATE', targetType: 'Event', targetId: id });
  } else {
    ev = await prisma.event.create({ data });
    await audit({ actorId: userId, action: 'CREATE', targetType: 'Event', targetId: ev.id });
  }
  for (const locale of ['fr', 'en'] as const) {
    const title = String(formData.get(`title_${locale}`) ?? '').trim();
    if (!title) continue;
    await prisma.eventTranslation.upsert({
      where: { eventId_locale: { eventId: ev.id, locale } },
      update: { title, summary: String(formData.get(`summary_${locale}`) ?? '') || null, contentMd: String(formData.get(`content_${locale}`) ?? '') || null },
      create: { eventId: ev.id, locale, title, summary: String(formData.get(`summary_${locale}`) ?? '') || null, contentMd: String(formData.get(`content_${locale}`) ?? '') || null },
    });
  }
  revalidatePath('/admin/agenda');
  return ev.id;
}

export async function deleteEvent(id: string) {
  const userId = await requireAdminUserId();
  await prisma.event.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'Event', targetId: id });
  revalidatePath('/admin/agenda');
}
