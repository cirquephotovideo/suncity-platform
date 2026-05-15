import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false as const, status: 401, error: 'unauthorized' };
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN' && role !== 'EDITOR') return { ok: false as const, status: 403, error: 'forbidden' };
  return { ok: true as const, userId: (session.user as { id: string }).id };
}

function shape(p: any) {
  if (!p) return null;
  const fr = p.translations?.find((x: any) => x.locale === 'fr');
  const en = p.translations?.find((x: any) => x.locale === 'en');
  return {
    id: p.id,
    slug: p.slug,
    kind: p.kind,
    active: p.active,
    stripeProductId: p.stripeProductId ?? null,
    coverImageUrl: p.coverImageUrl ?? null,
    galleryUrls: p.galleryUrls ?? [],
    category: p.category ?? null,
    tags: p.tags ?? [],
    redeemableFrom: p.redeemableFrom ? p.redeemableFrom.toISOString() : null,
    redeemableTo: p.redeemableTo ? p.redeemableTo.toISOString() : null,
    metaTitle: p.metaTitle ?? null,
    metaDescription: p.metaDescription ?? null,
    title_fr: fr?.title ?? '',
    description_fr: fr?.description ?? '',
    title_en: en?.title ?? '',
    description_en: en?.description ?? '',
    variants: (p.variants ?? []).map((v: any) => ({
      id: v.id,
      sku: v.sku,
      label: v.label,
      priceCents: v.priceCents,
      currency: v.currency,
      stripePriceId: v.stripePriceId ?? null,
      active: v.active,
      stockQty: v.stockQty ?? null,
      orderIndex: v.orderIndex,
    })),
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await params;
  const p = await prisma.product.findUnique({
    where: { id },
    include: { translations: true, variants: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!p) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, product: shape(p) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const updated = await prisma.product.update({
    where: { id },
    data: {
      slug: body.slug ? String(body.slug) : undefined,
      kind: body.kind ? (body.kind as any) : undefined,
      active: typeof body.active === 'boolean' ? body.active : undefined,
      stripeProductId: body.stripeProductId ?? null,
      coverImageUrl: body.coverImageUrl ?? null,
      galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls : [],
      category: body.category ?? null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      redeemableFrom: body.redeemableFrom ? new Date(body.redeemableFrom) : null,
      redeemableTo: body.redeemableTo ? new Date(body.redeemableTo) : null,
      metaTitle: body.metaTitle ?? null,
      metaDescription: body.metaDescription ?? null,
    },
  });

  for (const locale of ['fr', 'en'] as const) {
    const title = String(body[`title_${locale}`] || '').trim();
    const description = body[`description_${locale}`] || null;
    if (!title) {
      // remove translation if blanked
      await prisma.productTranslation.deleteMany({ where: { productId: id, locale: locale as any } });
      continue;
    }
    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: id, locale: locale as any } },
      update: { title, description },
      create: { productId: id, locale: locale as any, title, description },
    });
  }

  // Variants: replace strategy by id when present, else (re)create.
  if (Array.isArray(body.variants)) {
    const incomingIds = body.variants.filter((v: any) => v?.id).map((v: any) => String(v.id));
    // Delete variants not present anymore.
    await prisma.productVariant.deleteMany({
      where: { productId: id, id: { notIn: incomingIds.length ? incomingIds : ['__none__'] } },
    });
    let i = 0;
    for (const v of body.variants) {
      if (!v?.sku || !v?.label) continue;
      const data = {
        sku: String(v.sku),
        label: String(v.label),
        priceCents: Number(v.priceCents ?? 0),
        currency: String(v.currency || 'EUR'),
        stripePriceId: v.stripePriceId || null,
        active: typeof v.active === 'boolean' ? v.active : true,
        stockQty: v.stockQty != null && v.stockQty !== '' ? Number(v.stockQty) : null,
        orderIndex: typeof v.orderIndex === 'number' ? v.orderIndex : i,
      };
      if (v.id) {
        await prisma.productVariant.update({ where: { id: String(v.id) }, data });
      } else {
        await prisma.productVariant.create({ data: { ...data, productId: id } });
      }
      i++;
    }
  }

  await audit({ actorId: a.userId, action: 'UPDATE', targetType: 'Product', targetId: id });
  const full = await prisma.product.findUnique({
    where: { id: updated.id },
    include: { translations: true, variants: { orderBy: { orderIndex: 'asc' } } },
  });
  revalidatePath('/admin/products');
  revalidatePath('/billetterie');
  return NextResponse.json({ ok: true, product: shape(full) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  await audit({ actorId: a.userId, action: 'DELETE', targetType: 'Product', targetId: id });
  revalidatePath('/admin/products');
  revalidatePath('/billetterie');
  return NextResponse.json({ ok: true });
}
