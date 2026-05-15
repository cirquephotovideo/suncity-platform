import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertTariff } from '../actions';
import TariffForm from '@/components/admin/TariffForm';

export default async function EditTariff({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const t = await prisma.tariff.findUnique({ where: { id }, include: { translations: true } });
  if (!t) notFound();
  const fr = t.translations.find(x => x.locale === 'fr');
  const en = t.translations.find(x => x.locale === 'en');
  async function action(fd: FormData) { 'use server'; await upsertTariff(id, fd); }
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">{t.code}</h1>
      <TariffForm defaults={{
        code: t.code, priceCents: t.priceCents, daysApplicable: t.daysApplicable, conditionLabel: t.conditionLabel ?? '',
        orderIndex: t.orderIndex, active: t.active,
        label_fr: fr?.label ?? '', details_fr: fr?.details ?? '',
        label_en: en?.label ?? '', details_en: en?.details ?? '',
      }} action={action} />
    </div>
  );
}
