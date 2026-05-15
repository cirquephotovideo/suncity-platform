import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertBanner } from '../actions';
import BannerForm from '@/components/admin/BannerForm';

export default async function EditBanner({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const b = await prisma.banner.findUnique({ where: { id }, include: { translations: true } });
  if (!b) notFound();
  const fr = b.translations.find(x => x.locale === 'fr');
  const en = b.translations.find(x => x.locale === 'en');
  async function action(fd: FormData) { 'use server'; await upsertBanner(id, fd); }
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">{fr?.title ?? b.slug}</h1>
      <BannerForm defaults={{
        slug: b.slug, position: b.position, active: b.active,
        startsAt: b.startsAt, endsAt: b.endsAt, ctaUrl: b.ctaUrl ?? '', imageUrl: b.imageUrl ?? '',
        title_fr: fr?.title ?? '', body_fr: fr?.body ?? '', ctaLabel_fr: fr?.ctaLabel ?? '',
        title_en: en?.title ?? '', body_en: en?.body ?? '', ctaLabel_en: en?.ctaLabel ?? '',
      }} action={action} />
    </div>
  );
}
