'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import { isValidSkin } from '@/lib/skins';

export async function setActiveSkin(formData: FormData) {
  const userId = await requireAdminUserId();
  const themeKey = String(formData.get('themeKey') ?? '');
  if (!isValidSkin(themeKey)) throw new Error('invalid_skin');
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { themeKey },
    create: { id: 1, themeKey },
  });
  await audit({ actorId: userId, action: 'UPDATE', targetType: 'SiteSettings', targetId: '1', diff: { themeKey } as any });
  revalidatePath('/', 'layout');
  revalidatePath('/admin', 'layout');
}
