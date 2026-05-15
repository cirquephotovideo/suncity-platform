'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import type { ProductKind } from '@prisma/client';

export async function upsertProduct(id: string | null, formData: FormData) {
  const userId = await requireAdminUserId();
  const data = {
    slug: String(formData.get('slug') ?? '').trim(),
    kind: String(formData.get('kind') ?? 'TICKET_DAY') as ProductKind,
    active: formData.get('active') === 'on',
    coverImageUrl: String(formData.get('coverImageUrl') ?? '') || null,
  };
  let p;
  if (id) { p = await prisma.product.update({ where: { id }, data }); await audit({ actorId: userId, action: 'UPDATE', targetType: 'Product', targetId: id }); }
  else { p = await prisma.product.create({ data }); await audit({ actorId: userId, action: 'CREATE', targetType: 'Product', targetId: p.id }); }

  for (const locale of ['fr', 'en'] as const) {
    const title = String(formData.get(`title_${locale}`) ?? '').trim();
    const description = String(formData.get(`description_${locale}`) ?? '') || null;
    if (!title) continue;
    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: p.id, locale } },
      update: { title, description },
      create: { productId: p.id, locale, title, description },
    });
  }
  revalidatePath('/admin/products');
  return p.id;
}

export async function upsertVariant(productId: string, variantId: string | null, formData: FormData) {
  const userId = await requireAdminUserId();
  const data = {
    sku: String(formData.get('sku') ?? '').trim(),
    label: String(formData.get('label') ?? ''),
    priceCents: Number(formData.get('priceCents') ?? 0),
    orderIndex: Number(formData.get('orderIndex') ?? 0),
    active: formData.get('active') === 'on',
    productId,
  };
  let v;
  if (variantId) { v = await prisma.productVariant.update({ where: { id: variantId }, data }); await audit({ actorId: userId, action: 'UPDATE', targetType: 'ProductVariant', targetId: variantId }); }
  else { v = await prisma.productVariant.create({ data }); await audit({ actorId: userId, action: 'CREATE', targetType: 'ProductVariant', targetId: v.id }); }
  revalidatePath(`/admin/products/${productId}`);
  return v.id;
}

export async function deleteProduct(id: string) {
  const userId = await requireAdminUserId();
  await prisma.product.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'Product', targetId: id });
  revalidatePath('/admin/products');
}

export async function deleteVariant(variantId: string, productId: string) {
  const userId = await requireAdminUserId();
  await prisma.productVariant.delete({ where: { id: variantId } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'ProductVariant', targetId: variantId });
  revalidatePath(`/admin/products/${productId}`);
}
