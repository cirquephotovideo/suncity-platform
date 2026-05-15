import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertCampaign } from '../../actions';
import CampaignForm from '@/components/admin/CampaignForm';

function dt(d: Date | null | undefined) { return d ? d.toISOString().slice(0, 16) : ''; }

export default async function EditCampaign({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const c = await prisma.newsletterCampaign.findUnique({ where: { id } });
  if (!c) notFound();
  async function action(fd: FormData) { 'use server'; await upsertCampaign(id, fd); }
  return <div><h1 className="font-display text-3xl mb-6">{c.subject}</h1><CampaignForm defaults={{ subject: c.subject, scheduledAt: dt(c.scheduledAt), contentHtml: c.contentHtml }} action={action} /></div>;
}
