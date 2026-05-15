'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

export async function createPartner(formData: FormData) {
  const userId = await requireAdminUserId();
  const data = {
    name: String(formData.get('name') ?? ''),
    url: String(formData.get('url') ?? '') || null,
    logoUrl: String(formData.get('logoUrl') ?? '') || null,
    category: String(formData.get('category') ?? '') || null,
    orderIndex: Number(formData.get('orderIndex') ?? 0),
    active: formData.get('active') === 'on',
  };
  const p = await prisma.partner.create({ data });
  await audit({ actorId: userId, action: 'CREATE', targetType: 'Partner', targetId: p.id });
  revalidatePath('/admin/partners');
  return p.id;
}

export async function deletePartner(id: string) {
  const userId = await requireAdminUserId();
  await prisma.partner.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'Partner', targetId: id });
  revalidatePath('/admin/partners');
}
