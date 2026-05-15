'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import type { DayOfWeek } from '@prisma/client';

export async function upsertTariff(id: string | null, formData: FormData) {
  const userId = await requireAdminUserId();
  const days = formData.getAll('daysApplicable').map(String) as DayOfWeek[];
  const data = {
    code: String(formData.get('code') ?? '').trim().toUpperCase(),
    priceCents: Number(formData.get('priceCents') ?? 0),
    daysApplicable: days,
    conditionLabel: String(formData.get('conditionLabel') ?? '') || null,
    orderIndex: Number(formData.get('orderIndex') ?? 0),
    active: formData.get('active') === 'on',
  };
  let t;
  if (id) { t = await prisma.tariff.update({ where: { id }, data }); await audit({ actorId: userId, action: 'UPDATE', targetType: 'Tariff', targetId: id, diff: data as any }); }
  else { t = await prisma.tariff.create({ data }); await audit({ actorId: userId, action: 'CREATE', targetType: 'Tariff', targetId: t.id, diff: data as any }); }

  for (const locale of ['fr', 'en'] as const) {
    const label = String(formData.get(`label_${locale}`) ?? '').trim();
    if (!label) continue;
    await prisma.tariffTranslation.upsert({
      where: { tariffId_locale: { tariffId: t.id, locale } },
      update: { label, details: String(formData.get(`details_${locale}`) ?? '') || null },
      create: { tariffId: t.id, locale, label, details: String(formData.get(`details_${locale}`) ?? '') || null },
    });
  }
  revalidatePath('/admin/tarifs');
  return t.id;
}

export async function deleteTariff(id: string) {
  const userId = await requireAdminUserId();
  await prisma.tariff.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'Tariff', targetId: id });
  revalidatePath('/admin/tarifs');
}
