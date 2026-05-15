import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertRecurring } from '../../actions';
import RecurringForm from '@/components/admin/RecurringForm';

export default async function NewRecurring() {
  await requireAdmin();
  async function action(fd: FormData) {
    'use server';
    const id = await upsertRecurring(null, fd);
    redirect(`/admin/agenda/recurring/${id}`);
  }
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Nouveau récurrent</h1>
      <RecurringForm action={action} />
    </div>
  );
}
