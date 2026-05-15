import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertCampaign } from '../../actions';
import CampaignForm from '@/components/admin/CampaignForm';

export default async function NewCampaign() {
  await requireAdmin();
  async function action(fd: FormData) { 'use server'; const id = await upsertCampaign(null, fd); redirect(`/admin/newsletter/campaigns/${id}`); }
  return <div><h1 className="font-display text-3xl mb-6">Nouvelle campagne</h1><CampaignForm action={action} /></div>;
}
