import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertRecurring } from '../../actions';
import RecurringForm from '@/components/admin/RecurringForm';

export default async function EditRecurring({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const rec = await prisma.recurringEvent.findUnique({ where: { id }, include: { translations: true } });
  if (!rec) notFound();

  const fr = rec.translations.find(t => t.locale === 'fr');
  const en = rec.translations.find(t => t.locale === 'en');

  async function action(fd: FormData) {
    'use server';
    await upsertRecurring(id, fd);
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">{fr?.title ?? rec.slug}</h1>
      <RecurringForm
        defaults={{
          slug: rec.slug, dayOfWeek: rec.dayOfWeek, weekOfMonth: rec.weekOfMonth,
          startTime: rec.startTime, endTime: rec.endTime ?? '', priceLabel: rec.priceLabel ?? '',
          hostedBy: rec.hostedBy ?? '', externalUrl: rec.externalUrl ?? '',
          active: rec.active, orderIndex: rec.orderIndex,
          title_fr: fr?.title ?? '', summary_fr: fr?.summary ?? '',
          title_en: en?.title ?? '', summary_en: en?.summary ?? '',
        }}
        action={action}
      />
    </div>
  );
}
