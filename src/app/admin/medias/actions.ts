'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import type { MediaStatus } from '@prisma/client';

export async function setMediaStatus(id: string, status: MediaStatus) {
  const userId = await requireAdminUserId();
  await prisma.mediaAsset.update({
    where: { id },
    data: { status, approvedById: status === 'APPROVED' ? userId : null, approvedAt: status === 'APPROVED' ? new Date() : null },
  });
  await audit({ actorId: userId, action: 'UPDATE', targetType: 'MediaAsset', targetId: id, diff: { status } });
  revalidatePath('/admin/medias');
}

export async function deleteMedia(id: string) {
  const userId = await requireAdminUserId();
  await prisma.mediaAsset.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'MediaAsset', targetId: id });
  revalidatePath('/admin/medias');
}

export async function registerMediaByUrl(formData: FormData) {
  const userId = await requireAdminUserId();
  const key = String(formData.get('key') ?? '').trim();
  const mime = String(formData.get('mime') ?? 'image/jpeg');
  const sizeBytes = Number(formData.get('sizeBytes') ?? 0);
  const alt = String(formData.get('alt') ?? '') || null;
  if (!key) throw new Error('key required');
  const m = await prisma.mediaAsset.create({
    data: { key, mime, sizeBytes, alt, status: 'PENDING', uploadedById: userId },
  });
  await audit({ actorId: userId, action: 'CREATE', targetType: 'MediaAsset', targetId: m.id, diff: { key, mime } });
  revalidatePath('/admin/medias');
  return m.id;
}
