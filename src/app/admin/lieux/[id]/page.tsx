import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertLocation } from '../actions';
import LocationForm from '@/components/admin/LocationForm';

export default async function EditLocation({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const loc = await prisma.location.findUnique({ where: { id }, include: { translations: true } });
  if (!loc) notFound();
  const fr = loc.translations.find(x => x.locale === 'fr');
  const en = loc.translations.find(x => x.locale === 'en');
  async function action(fd: FormData) { 'use server'; await upsertLocation(id, fd); }
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">{fr?.title ?? loc.slug}</h1>
      <LocationForm defaults={{
        slug: loc.slug, iconKey: loc.iconKey ?? '', coverImageUrl: loc.coverImageUrl ?? '',
        orderIndex: loc.orderIndex, active: loc.active,
        title_fr: fr?.title ?? '', summary_fr: fr?.summary ?? '', contentMd_fr: fr?.contentMd ?? '',
        title_en: en?.title ?? '', summary_en: en?.summary ?? '', contentMd_en: en?.contentMd ?? '',
      }} action={action} />
    </div>
  );
}
