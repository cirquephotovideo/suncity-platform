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

function shape(b: any) {
  if (!b) return null;
  const fr = b.translations?.find((x: any) => x.locale === 'fr');
  const en = b.translations?.find((x: any) => x.locale === 'en');
  return {
    id: b.id,
    slug: b.slug,
    position: b.position,
    active: b.active,
    eyebrow: b.eyebrow ?? null,
    imageUrl: b.imageUrl ?? null,
    videoUrl: b.videoUrl ?? null,
    accentColor: b.accentColor ?? null,
    themeSlug: b.themeSlug ?? null,
    ctaUrl: b.ctaUrl ?? null,
    ctaUrl2: b.ctaUrl2 ?? null,
    ctaLabel2: b.ctaLabel2 ?? null,
    aiPrompt: b.aiPrompt ?? null,
    presetSlug: b.presetSlug ?? null,
    startsAt: b.startsAt ? b.startsAt.toISOString() : null,
    endsAt: b.endsAt ? b.endsAt.toISOString() : null,
    title_fr: fr?.title ?? '',
    body_fr: fr?.body ?? '',
    ctaLabel_fr: fr?.ctaLabel ?? '',
    title_en: en?.title ?? '',
    body_en: en?.body ?? '',
    ctaLabel_en: en?.ctaLabel ?? '',
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await params;
  const b = await prisma.banner.findUnique({ where: { id }, include: { translations: true } });
  if (!b) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, banner: shape(b) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const updated = await prisma.banner.update({
    where: { id },
    data: {
      slug: body.slug ? String(body.slug) : undefined,
      position: body.position ? String(body.position) : undefined,
      active: typeof body.active === 'boolean' ? body.active : undefined,
      eyebrow: body.eyebrow ?? null,
      imageUrl: body.imageUrl ?? null,
      videoUrl: body.videoUrl ?? null,
      accentColor: body.accentColor ?? null,
      themeSlug: body.themeSlug ?? null,
      ctaUrl: body.ctaUrl ?? null,
      ctaUrl2: body.ctaUrl2 ?? null,
      ctaLabel2: body.ctaLabel2 ?? null,
      aiPrompt: body.aiPrompt ?? null,
      presetSlug: body.presetSlug ?? null,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
    },
  });

  for (const locale of ['fr', 'en'] as const) {
    const title = String(body[`title_${locale}`] || '').trim();
    const bodyTxt = body[`body_${locale}`] || null;
    const ctaLabel = body[`ctaLabel_${locale}`] || null;
    if (!title && !bodyTxt && !ctaLabel) continue;
    if (!title) continue;
    await prisma.bannerTranslation.upsert({
      where: { bannerId_locale: { bannerId: updated.id, locale } },
      update: { title, body: bodyTxt, ctaLabel },
      create: { bannerId: updated.id, locale, title, body: bodyTxt, ctaLabel },
    });
  }

  await audit({ actorId: a.userId, action: 'UPDATE', targetType: 'Banner', targetId: id });

  const full = await prisma.banner.findUnique({ where: { id }, include: { translations: true } });
  revalidatePath('/admin/banners');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, banner: shape(full) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await params;
  await prisma.banner.delete({ where: { id } });
  await audit({ actorId: a.userId, action: 'DELETE', targetType: 'Banner', targetId: id });
  revalidatePath('/admin/banners');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
