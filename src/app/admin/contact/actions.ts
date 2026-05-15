'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import type { ContactStatus } from '@prisma/client';

export async function setContactStatus(id: string, status: ContactStatus) {
  const userId = await requireAdminUserId();
  const data: any = { status };
  if (status === 'READ') data.readAt = new Date();
  if (status === 'REPLIED') { data.repliedAt = new Date(); data.repliedById = userId; }
  await prisma.contactMessage.update({ where: { id }, data });
  await audit({ actorId: userId, action: 'UPDATE', targetType: 'ContactMessage', targetId: id, diff: { status } });
  revalidatePath('/admin/contact');
  revalidatePath(`/admin/contact/${id}`);
}

export async function deleteContact(id: string) {
  const userId = await requireAdminUserId();
  await prisma.contactMessage.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'ContactMessage', targetId: id });
  revalidatePath('/admin/contact');
}
