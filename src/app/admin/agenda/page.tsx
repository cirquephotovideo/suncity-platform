import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteRecurring, deleteEvent } from './actions';

export default async function AgendaIndex() {
  await requireAdmin();
  const [recurring, events] = await Promise.all([
    prisma.recurringEvent.findMany({ include: { translations: { where: { locale: 'fr' } } }, orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }] }),
    prisma.event.findMany({ include: { translations: { where: { locale: 'fr' } } }, orderBy: { startsAt: 'desc' }, take: 50 }),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl">Agenda — récurrents</h1>
          <Link href="/admin/agenda/recurring/new" className="btn-primary text-sm">+ Nouveau récurrent</Link>
        </div>
        <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg text-textMuted text-left">
              <tr><th className="px-4 py-2.5">Jour</th><th className="px-4 py-2.5">Semaine</th><th className="px-4 py-2.5">Titre FR</th><th className="px-4 py-2.5">Heures</th><th className="px-4 py-2.5">Tarif</th><th className="px-4 py-2.5">Actif</th><th className="px-4 py-2.5 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {recurring.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2.5">{r.dayOfWeek}</td>
                  <td className="px-4 py-2.5 text-xs text-textMuted">{r.weekOfMonth}</td>
                  <td className="px-4 py-2.5">{r.translations[0]?.title ?? <em className="text-textMuted">—</em>}</td>
                  <td className="px-4 py-2.5 text-textMuted text-xs">{r.startTime}{r.endTime ? `—${r.endTime}` : ''}</td>
                  <td className="px-4 py-2.5 text-primary text-xs">{r.priceLabel ?? '—'}</td>
                  <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${r.active ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>{r.active ? 'OUI' : 'NON'}</span></td>
                  <td className="px-4 py-2.5 text-right space-x-2 text-xs">
                    <Link href={`/admin/agenda/recurring/${r.id}`} className="text-primary hover:underline">Éditer</Link>
                    <form action={deleteRecurring.bind(null, r.id)} className="inline"><button className="text-danger hover:underline">Suppr.</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl">Agenda — événements one-shot</h2>
          <Link href="/admin/agenda/event/new" className="btn-primary text-sm">+ Nouvel événement</Link>
        </div>
        <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Slug</th><th className="px-4 py-2.5">Titre FR</th><th className="px-4 py-2.5">Statut</th><th className="px-4 py-2.5 text-right">Actions</th></tr></thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-xs">{e.startsAt.toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{e.slug}</td>
                  <td className="px-4 py-2.5">{e.translations[0]?.title ?? <em className="text-textMuted">—</em>}</td>
                  <td className="px-4 py-2.5"><span className="text-xs">{e.status}</span></td>
                  <td className="px-4 py-2.5 text-right space-x-2 text-xs">
                    <Link href={`/admin/agenda/event/${e.id}`} className="text-primary hover:underline">Éditer</Link>
                    <form action={deleteEvent.bind(null, e.id)} className="inline"><button className="text-danger hover:underline">Suppr.</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
