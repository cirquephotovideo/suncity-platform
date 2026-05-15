'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

export async function createPage(formData: FormData) {
  const userId = await requireAdminUserId();
  const slug = String(formData.get('slug') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'fr') as 'fr' | 'en';
  const title = String(formData.get('title') ?? '').trim();
  if (!slug || !title) throw new Error('slug + title required');
  const page = await prisma.page.create({
    data: { slug, locale, title, status: 'DRAFT', excerpt: String(formData.get('excerpt') ?? '') || null, contentHtml: String(formData.get('contentHtml') ?? '') || null },
  });
  await audit({ actorId: userId, action: 'CREATE', targetType: 'Page', targetId: page.id, diff: { slug, locale, title } });
  revalidatePath('/admin/pages');
  return { ok: true, id: page.id };
}

export async function updatePage(id: string, formData: FormData) {
  const userId = await requireAdminUserId();
  const data = {
    title: String(formData.get('title') ?? ''),
    excerpt: String(formData.get('excerpt') ?? '') || null,
    contentHtml: String(formData.get('contentHtml') ?? '') || null,
    seoTitle: String(formData.get('seoTitle') ?? '') || null,
    seoDesc: String(formData.get('seoDesc') ?? '') || null,
  };
  await prisma.page.update({ where: { id }, data });
  await audit({ actorId: userId, action: 'UPDATE', targetType: 'Page', targetId: id, diff: data as any });
  revalidatePath('/admin/pages');
  revalidatePath(`/admin/pages/${id}`);
}

export async function publishPage(id: string) {
  const userId = await requireAdminUserId();
  await prisma.page.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
  await audit({ actorId: userId, action: 'PUBLISH', targetType: 'Page', targetId: id });
  revalidatePath('/admin/pages');
  revalidatePath(`/admin/pages/${id}`);
}

export async function unpublishPage(id: string) {
  const userId = await requireAdminUserId();
  await prisma.page.update({ where: { id }, data: { status: 'DRAFT' } });
  await audit({ actorId: userId, action: 'UNPUBLISH', targetType: 'Page', targetId: id });
  revalidatePath('/admin/pages');
}

export async function deletePage(id: string) {
  const userId = await requireAdminUserId();
  await prisma.page.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'Page', targetId: id });
  revalidatePath('/admin/pages');
}
