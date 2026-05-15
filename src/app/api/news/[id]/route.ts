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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await params;
  const row = await prisma.article.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  const rich = await buildRich(row.slug);
  return NextResponse.json({ ok: true, news: rich });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  const slug = existing.slug;
  const body = await req.json().catch(() => ({}));

  const baseData: any = {
    coverImageUrl: body.coverImageUrl ?? null,
    ogImageUrl: body.ogImageUrl ?? null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    category: body.category ?? null,
    status: (body.status || existing.status) as any,
    pinned: typeof body.pinned === 'boolean' ? body.pinned : existing.pinned,
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    metaTitle: body.metaTitle ?? null,
    metaDescription: body.metaDescription ?? null,
    authorId: body.authorId ?? existing.authorId ?? null,
  };

  for (const locale of ['fr', 'en'] as const) {
    const title = String(body[`title_${locale}`] || '').trim();
    const excerpt = body[`excerpt_${locale}`] || null;
    const contentHtml = body[`contentHtml_${locale}`] || null;
    if (!title) {
      // delete sibling row if it existed and now has no title (only EN ever optional)
      if (locale === 'en') {
        await prisma.article.deleteMany({ where: { slug, locale: locale as any } });
      }
      continue;
    }
    await prisma.article.upsert({
      where: { slug_locale: { slug, locale: locale as any } },
      update: { ...baseData, title, excerpt, contentHtml },
      create: { ...baseData, slug, locale: locale as any, title, excerpt, contentHtml },
    });
  }
  await audit({ actorId: a.userId, action: 'UPDATE', targetType: 'Article', targetId: id });
  const rich = await buildRich(slug);
  revalidatePath('/admin/news');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, news: rich });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await params;
  const row = await prisma.article.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  await prisma.article.deleteMany({ where: { slug: row.slug } });
  await audit({ actorId: a.userId, action: 'DELETE', targetType: 'Article', targetId: id });
  revalidatePath('/admin/news');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
