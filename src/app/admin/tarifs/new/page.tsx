import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertTariff } from '../actions';
import TariffForm from '@/components/admin/TariffForm';

export default async function NewTariff() {
  await requireAdmin();
  async function action(fd: FormData) { 'use server'; const id = await upsertTariff(null, fd); redirect(`/admin/tarifs/${id}`); }
  return <div><h1 className="font-display text-3xl mb-6">Nouveau tarif</h1><TariffForm action={action} /></div>;
}
