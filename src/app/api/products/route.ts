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

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);
}

export async function GET(req: NextRequest) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const url = new URL(req.url);
  const kind = url.searchParams.get('kind');
  const where: any = {};
  if (kind) where.kind = kind;
  const items = await prisma.product.findMany({
    where,
    include: { translations: true, variants: { orderBy: { orderIndex: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({ ok: true, products: items.map(shape) });
}

export async function POST(req: NextRequest) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const body = await req.json().catch(() => ({}));
  let slug = String(body.slug || '').trim();
  if (!slug) {
    const baseTitle = String(body.title_fr || body.title_en || '').trim();
    if (!baseTitle) return NextResponse.json({ ok: false, error: 'title or slug required' }, { status: 400 });
    slug = slugify(baseTitle);
  }
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ ok: false, error: 'slug already taken' }, { status: 409 });

  const created = await prisma.product.create({
    data: {
      slug,
      kind: (body.kind || 'TICKET_DAY') as any,
      active: typeof body.active === 'boolean' ? body.active : true,
      stripeProductId: body.stripeProductId || null,
      coverImageUrl: body.coverImageUrl || null,
      galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls : [],
      category: body.category || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      redeemableFrom: body.redeemableFrom ? new Date(body.redeemableFrom) : null,
      redeemableTo: body.redeemableTo ? new Date(body.redeemableTo) : null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
    },
  });

  for (const locale of ['fr', 'en'] as const) {
    const title = String(body[`title_${locale}`] || '').trim();
    if (!title) continue;
    await prisma.productTranslation.create({
      data: {
        productId: created.id,
        locale: locale as any,
        title,
        description: body[`description_${locale}`] || null,
      },
    });
  }

  // Variants
  if (Array.isArray(body.variants)) {
    let i = 0;
    for (const v of body.variants) {
      if (!v?.sku || !v?.label) continue;
      await prisma.productVariant.create({
        data: {
          productId: created.id,
          sku: String(v.sku),
          label: String(v.label),
          priceCents: Number(v.priceCents ?? 0),
          currency: String(v.currency || 'EUR'),
          stripePriceId: v.stripePriceId || null,
          active: typeof v.active === 'boolean' ? v.active : true,
          stockQty: v.stockQty != null ? Number(v.stockQty) : null,
          orderIndex: typeof v.orderIndex === 'number' ? v.orderIndex : i,
        },
      });
      i++;
    }
  }

  await audit({ actorId: a.userId, action: 'CREATE', targetType: 'Product', targetId: created.id });
  const full = await prisma.product.findUnique({
    where: { id: created.id },
    include: { translations: true, variants: { orderBy: { orderIndex: 'asc' } } },
  });
  revalidatePath('/admin/products');
  revalidatePath('/billetterie');
  return NextResponse.json({ ok: true, product: shape(full) });
}
