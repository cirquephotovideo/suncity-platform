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

function shapeRow(a: any) {
  if (!a) return null;
  return {
    id: a.id,
    slug: a.slug,
    locale: a.locale,
    title: a.title ?? '',
    excerpt: a.excerpt ?? '',
    contentHtml: a.contentHtml ?? '',
    coverImageUrl: a.coverImageUrl ?? null,
    ogImageUrl: a.ogImageUrl ?? null,
    tags: a.tags ?? [],
    category: a.category ?? null,
    status: a.status,
    pinned: !!a.pinned,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    scheduledAt: a.scheduledAt ? a.scheduledAt.toISOString() : null,
    metaTitle: a.metaTitle ?? null,
    metaDescription: a.metaDescription ?? null,
    authorId: a.authorId ?? null,
    createdAt: a.createdAt ? a.createdAt.toISOString() : null,
    updatedAt: a.updatedAt ? a.updatedAt.toISOString() : null,
  };
}

// Build a denormalised "rich" object that bundles FR + EN sibling rows.
async function buildRich(slug: string) {
  const [fr, en] = await Promise.all([
    prisma.article.findUnique({ where: { slug_locale: { slug, locale: 'fr' as any } } }),
    prisma.article.findUnique({ where: { slug_locale: { slug, locale: 'en' as any } } }),
  ]);
  const base = fr ?? en;
  if (!base) return null;
  return {
    id: (fr ?? en)!.id,
    slug,
    category: base.category ?? null,
    status: base.status,
    pinned: !!base.pinned,
    coverImageUrl: base.coverImageUrl ?? null,
    ogImageUrl: base.ogImageUrl ?? null,
    tags: base.tags ?? [],
    publishedAt: base.publishedAt ? base.publishedAt.toISOString() : null,
    scheduledAt: base.scheduledAt ? base.scheduledAt.toISOString() : null,
    metaTitle: base.metaTitle ?? null,
    metaDescription: base.metaDescription ?? null,
    authorId: base.authorId ?? null,
    title_fr: fr?.title ?? '',
    excerpt_fr: fr?.excerpt ?? '',
    contentHtml_fr: fr?.contentHtml ?? '',
    title_en: en?.title ?? '',
    excerpt_en: en?.excerpt ?? '',
    contentHtml_en: en?.contentHtml ?? '',
    createdAt: base.createdAt ? base.createdAt.toISOString() : null,
    updatedAt: base.updatedAt ? base.updatedAt.toISOString() : null,
  };
}

export async function GET(req: NextRequest) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const where: any = { locale: 'fr' as any };
  if (status) where.status = status;
  const items = await prisma.article.findMany({
    where,
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 200,
  });
  // Hydrate each with its EN sibling so the list can show locale coverage.
  const rich = await Promise.all(items.map(i => buildRich(i.slug)));
  return NextResponse.json({ ok: true, news: rich.filter(Boolean) });
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
  // Ensure slug not already used (FR row).
  const existing = await prisma.article.findUnique({ where: { slug_locale: { slug, locale: 'fr' as any } } });
  if (existing) return NextResponse.json({ ok: false, error: 'slug already taken' }, { status: 409 });

  const baseData = {
    slug,
    coverImageUrl: body.coverImageUrl || null,
    ogImageUrl: body.ogImageUrl || null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    category: body.category || null,
    status: (body.status || 'DRAFT') as any,
    pinned: !!body.pinned,
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    metaTitle: body.metaTitle || null,
    metaDescription: body.metaDescription || null,
    authorId: body.authorId || null,
  };

  const created: any[] = [];
  for (const locale of ['fr', 'en'] as const) {
    const title = String(body[`title_${locale}`] || '').trim();
    if (!title && locale === 'en') continue; // EN optional
    if (!title && locale === 'fr') return NextResponse.json({ ok: false, error: 'title_fr requis' }, { status: 400 });
    const row = await prisma.article.create({
      data: {
        ...baseData,
        locale: locale as any,
        title,
        excerpt: body[`excerpt_${locale}`] || null,
        contentHtml: body[`contentHtml_${locale}`] || null,
      },
    });
    created.push(row);
  }
  await audit({ actorId: a.userId, action: 'CREATE', targetType: 'Article', targetId: created[0].id });
  const rich = await buildRich(slug);
  revalidatePath('/admin/news');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, news: rich });
}
