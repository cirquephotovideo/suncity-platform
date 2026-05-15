import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertEvent } from '../../actions';
import EventForm from '@/components/admin/EventForm';

export default async function NewEvent() {
  await requireAdmin();
  async function action(fd: FormData) { 'use server'; const id = await upsertEvent(null, fd); redirect(`/admin/agenda/event/${id}`); }
  return <div><h1 className="font-display text-3xl mb-6">Nouvel événement</h1><EventForm action={action} /></div>;
}
