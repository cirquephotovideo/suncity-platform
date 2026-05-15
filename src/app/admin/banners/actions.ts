'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

export async function upsertBanner(id: string | null, formData: FormData) {
  const userId = await requireAdminUserId();
  const data = {
    slug: String(formData.get('slug') ?? '').trim(),
    position: String(formData.get('position') ?? 'top'),
    active: formData.get('active') === 'on',
    startsAt: formData.get('startsAt') ? new Date(String(formData.get('startsAt'))) : null,
    endsAt: formData.get('endsAt') ? new Date(String(formData.get('endsAt'))) : null,
    ctaUrl: String(formData.get('ctaUrl') ?? '') || null,
    imageUrl: String(formData.get('imageUrl') ?? '') || null,
  };
  let b;
  if (id) { b = await prisma.banner.update({ where: { id }, data }); await audit({ actorId: userId, action: 'UPDATE', targetType: 'Banner', targetId: id }); }
  else { b = await prisma.banner.create({ data }); await audit({ actorId: userId, action: 'CREATE', targetType: 'Banner', targetId: b.id }); }
  for (const locale of ['fr', 'en'] as const) {
    const title = String(formData.get(`title_${locale}`) ?? '').trim();
    if (!title) continue;
    await prisma.bannerTranslation.upsert({
      where: { bannerId_locale: { bannerId: b.id, locale } },
      update: { title, body: String(formData.get(`body_${locale}`) ?? '') || null, ctaLabel: String(formData.get(`ctaLabel_${locale}`) ?? '') || null },
      create: { bannerId: b.id, locale, title, body: String(formData.get(`body_${locale}`) ?? '') || null, ctaLabel: String(formData.get(`ctaLabel_${locale}`) ?? '') || null },
    });
  }
  revalidatePath('/admin/banners');
  revalidatePath('/', 'layout');
  return b.id;
}

export async function deleteBanner(id: string) {
  const userId = await requireAdminUserId();
  await prisma.banner.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'Banner', targetId: id });
  revalidatePath('/admin/banners');
  revalidatePath('/', 'layout');
}
