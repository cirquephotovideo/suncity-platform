import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertBanner } from '../actions';
import BannerForm from '@/components/admin/BannerForm';

export default async function NewBanner() {
  await requireAdmin();
  async function action(fd: FormData) { 'use server'; const id = await upsertBanner(null, fd); redirect(`/admin/banners/${id}`); }
  return <div><h1 className="font-display text-3xl mb-6">Nouvelle bannière</h1><BannerForm action={action} /></div>;
}
