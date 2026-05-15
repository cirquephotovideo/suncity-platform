import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertLocation } from '../actions';
import LocationForm from '@/components/admin/LocationForm';

export default async function NewLocation() {
  await requireAdmin();
  async function action(fd: FormData) { 'use server'; const id = await upsertLocation(null, fd); redirect(`/admin/lieux/${id}`); }
  return <div><h1 className="font-display text-3xl mb-6">Nouveau lieu</h1><LocationForm action={action} /></div>;
}
