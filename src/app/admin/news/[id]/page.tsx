import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';

export default async function NewsRedirect({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  redirect(`/admin/news/${id}/edit`);
}
