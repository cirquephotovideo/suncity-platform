'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { encryptSecret } from '@/lib/secrets-crypto';
import { revalidatePath } from 'next/cache';

export async function createSecret(formData: FormData) {
  const userId = await requireAdminUserId();
  const key = String(formData.get('key') ?? '').trim();
  const description = String(formData.get('description') ?? '') || null;
  const value = String(formData.get('value') ?? '');
  if (!key || !value) throw new Error('key and value required');
  await prisma.adminSecret.create({
    data: { key, description, value: encryptSecret(value) },
  });
  await audit({ actorId: userId, action: 'CREATE', targetType: 'AdminSecret', diff: { key } });
  revalidatePath('/admin/secrets');
}

export async function deleteSecret(id: string) {
  const userId = await requireAdminUserId();
  const s = await prisma.adminSecret.findUnique({ where: { id } });
  if (s) {
    await prisma.adminSecret.delete({ where: { id } });
    await audit({ actorId: userId, action: 'DELETE', targetType: 'AdminSecret', diff: { key: s.key } });
  }
  revalidatePath('/admin/secrets');
}
