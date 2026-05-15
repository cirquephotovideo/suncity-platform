import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteCampaign, sendCampaignNow as _sendCampaignNow } from './actions';

async function sendCampaignNow(id: string) {
  'use server';
  await _sendCampaignNow(id);
}

export default async function NewsletterIndex() {
  await requireAdmin();
  const [subs, campaigns] = await Promise.all([
    prisma.newsletterSubscriber.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.newsletterCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);
  const counts = Object.fromEntries(subs.map(s => [s.status, s._count._all]));

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-3xl mb-4">Newsletter</h1>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-bgAlt border border-border rounded-lg p-5"><p className="text-xs text-textMuted">Confirmés</p><p className="text-3xl text-success font-display mt-1">{counts.CONFIRMED ?? 0}</p></div>
          <div className="bg-bgAlt border border-border rounded-lg p-5"><p className="text-xs text-textMuted">En attente</p><p className="text-3xl text-primary font-display mt-1">{counts.PENDING ?? 0}</p></div>
          <div className="bg-bgAlt border border-border rounded-lg p-5"><p className="text-xs text-textMuted">Désinscrits</p><p className="text-3xl text-textMuted font-display mt-1">{counts.UNSUBSCRIBED ?? 0}</p></div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Campagnes</h2>
          <Link href="/admin/newsletter/campaigns/new" className="btn-primary text-sm">+ Nouvelle campagne</Link>
        </div>
        <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2.5">Sujet</th><th className="px-4 py-2.5">Programmé</th><th className="px-4 py-2.5">Envoyé</th><th className="px-4 py-2.5">Destinataires</th><th className="px-4 py-2.5 text-right">Actions</th></tr></thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-2.5">{c.subject}</td>
                  <td className="px-4 py-2.5 text-xs text-textMuted">{c.scheduledAt ? c.scheduledAt.toLocaleString('fr-FR') : '—'}</td>
                  <td className="px-4 py-2.5 text-xs">{c.sentAt ? <span className="text-success">{c.sentAt.toLocaleString('fr-FR')}</span> : '—'}</td>
                  <td className="px-4 py-2.5 text-xs">{c.recipients ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right space-x-2 text-xs">
                    <Link href={`/admin/newsletter/campaigns/${c.id}`} className="text-primary hover:underline">Éditer</Link>
                    {!c.sentAt && <form action={sendCampaignNow.bind(null, c.id)} className="inline"><button className="text-success hover:underline">Envoyer</button></form>}
                    <form action={deleteCampaign.bind(null, c.id)} className="inline"><button className="text-danger hover:underline">Suppr.</button></form>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-textMuted italic">Aucune campagne.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
