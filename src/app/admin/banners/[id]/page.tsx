import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';

export default async function BannerEditRedirect({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  redirect(`/admin/banners/${id}/edit`);
}
