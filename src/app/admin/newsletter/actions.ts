'use server';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import { sendMail } from '@/lib/mail';
import { requireAdminUserId } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

export async function upsertCampaign(id: string | null, formData: FormData) {
  const userId = await requireAdminUserId();
  const data = {
    subject: String(formData.get('subject') ?? ''),
    contentHtml: String(formData.get('contentHtml') ?? ''),
    scheduledAt: formData.get('scheduledAt') ? new Date(String(formData.get('scheduledAt'))) : null,
  };
  let c;
  if (id) { c = await prisma.newsletterCampaign.update({ where: { id }, data }); await audit({ actorId: userId, action: 'UPDATE', targetType: 'NewsletterCampaign', targetId: id }); }
  else { c = await prisma.newsletterCampaign.create({ data }); await audit({ actorId: userId, action: 'CREATE', targetType: 'NewsletterCampaign', targetId: c.id }); }
  revalidatePath('/admin/newsletter');
  return c.id;
}

export async function sendCampaignNow(id: string) {
  const userId = await requireAdminUserId();
  const c = await prisma.newsletterCampaign.findUnique({ where: { id } });
  if (!c) throw new Error('campaign not found');

  const subs = await prisma.newsletterSubscriber.findMany({ where: { status: 'CONFIRMED' } });
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  let sent = 0;
  for (const s of subs) {
    try {
      const unsubLink = `${base}/api/newsletter/unsubscribe/${s.unsubscribeToken}`;
      const html = `${c.contentHtml}<hr style="margin-top:24px"><p style="font-size:11px;color:#888"><a href="${unsubLink}">Se désinscrire</a></p>`;
      await sendMail({ to: s.email, subject: c.subject, html });
      sent++;
    } catch (e) { console.error(`send failed for ${s.email}`, e); }
  }
  await prisma.newsletterCampaign.update({ where: { id }, data: { sentAt: new Date(), recipients: sent } });
  await audit({ actorId: userId, action: 'EXPORT', targetType: 'NewsletterCampaign', targetId: id, diff: { recipients: sent } });
  revalidatePath('/admin/newsletter');
  return { sent };
}

export async function deleteCampaign(id: string) {
  const userId = await requireAdminUserId();
  await prisma.newsletterCampaign.delete({ where: { id } });
  await audit({ actorId: userId, action: 'DELETE', targetType: 'NewsletterCampaign', targetId: id });
  revalidatePath('/admin/newsletter');
}
