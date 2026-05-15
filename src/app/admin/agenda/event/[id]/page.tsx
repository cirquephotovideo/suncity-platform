import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertEvent } from '../../actions';
import EventForm from '@/components/admin/EventForm';

function dtLocal(d: Date | null | undefined) { return d ? d.toISOString().slice(0, 16) : ''; }

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const ev = await prisma.event.findUnique({ where: { id }, include: { translations: true } });
  if (!ev) notFound();
  const fr = ev.translations.find(t => t.locale === 'fr');
  const en = ev.translations.find(t => t.locale === 'en');
  async function action(fd: FormData) { 'use server'; await upsertEvent(id, fd); }
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">{fr?.title ?? ev.slug}</h1>
      <EventForm defaults={{
        slug: ev.slug, status: ev.status, startsAt: dtLocal(ev.startsAt), endsAt: dtLocal(ev.endsAt),
        externalUrl: ev.externalUrl ?? '', coverImageUrl: ev.coverImageUrl ?? '',
        title_fr: fr?.title ?? '', summary_fr: fr?.summary ?? '', content_fr: fr?.contentMd ?? '',
        title_en: en?.title ?? '', summary_en: en?.summary ?? '', content_en: en?.contentMd ?? '',
      }} action={action} />
    </div>
  );
}
