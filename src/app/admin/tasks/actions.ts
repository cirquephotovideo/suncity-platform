'use server';

import { revalidatePath } from 'next/cache';
import { TaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';

export async function upsertTask(formData: FormData): Promise<void> {
  const actorId = await requireAdminUserId();
  const id = (formData.get('id') as string | null)?.trim() || undefined;
  const title = (formData.get('title') as string).trim();
  const descriptionMd = (formData.get('descriptionMd') as string | null)?.trim() || null;
  const status = (formData.get('status') as TaskStatus) || TaskStatus.TODO;
  const priority = (formData.get('priority') as string) || 'MEDIUM';
  const dueAt = (formData.get('dueAt') as string | null)
    ? new Date(formData.get('dueAt') as string)
    : null;
  const assignedToId = (formData.get('assignedToId') as string | null)?.trim() || null;

  if (id) {
    await prisma.task.update({
      where: { id },
      data: { title, descriptionMd, status, priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT', dueAt, assignedToId },
    });
    await audit({ actorId, action: 'UPDATE', targetType: 'Task', targetId: id });
  } else {
    const task = await prisma.task.create({
      data: { title, descriptionMd, status, priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT', dueAt, assignedToId, createdById: actorId },
    });
    await audit({ actorId, action: 'CREATE', targetType: 'Task', targetId: task.id });
  }

  revalidatePath('/admin/tasks');
}

export async function moveTask(id: string, newStatus: TaskStatus): Promise<void> {
  const actorId = await requireAdminUserId();
  const before = await prisma.task.findUniqueOrThrow({ where: { id }, select: { status: true } });
  await prisma.task.update({ where: { id }, data: { status: newStatus } });
  await audit({
    actorId,
    action: 'UPDATE',
    targetType: 'Task',
    targetId: id,
    diff: { status: { from: before.status, to: newStatus } },
  });
  revalidatePath('/admin/tasks');
}

export async function deleteTask(id: string): Promise<void> {
  const actorId = await requireAdminUserId();
  await prisma.task.delete({ where: { id } });
  await audit({ actorId, action: 'DELETE', targetType: 'Task', targetId: id });
  revalidatePath('/admin/tasks');
}
