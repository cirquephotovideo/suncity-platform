'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

export async function upsertLocation(id: string | null, formData: FormData) {
  const userId = await requireAdminUserId();
  const data = {
    slug: String(formData.get('slug') ?? '').trim(),
    iconKey: String(formData.get('iconKey') ?? '') || null,
    coverImageUrl: String(formData.get('coverImageUrl') ?? '') || null,
    orderIndex: Number(formData.get('orderIndex') ?? 0),
    active: formData.get('active') === 'on',
  };
  let loc;
  if (id) { loc = await prisma.location.update({ where: { id }, data }); await audit({ actorId: userId, action: 'UPDATE', targetType: 'Location', targetId: id, diff: data }); }
  else { loc = await prisma.location.create({ data }); await audit({ actorId: userId, action: 'CREATE', targetType: 'Location', targetId: loc.id, diff: data }); }

  for (const locale of ['fr', 'en'] as const) {
    const title = String(formData.get(`title_${locale}`) ?? '').trim();
    const summary = String(formData.get(`summary_${locale}`) ?? '');
    const contentMd = String(formData.get(`contentMd_${locale}`) ?? '');
    if (!title) continue;
    await prisma.locationTranslation.upsert({
      where: { locationId_locale: { locationId: loc.id, locale } },
      update: { title, summary, contentMd },
      create: { locationId: loc.id, locale, title, summary, contentMd },
    });
  }
  revalidatePath('/admin/lieux');
  return loc.id;
}

export async function deleteLocation(id: string) {
  const userId = await requireAdminUserId();
  await prisma.location.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'Location', targetId: id });
  revalidatePath('/admin/lieux');
}
