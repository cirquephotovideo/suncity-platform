import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { deletePartner } from './actions';

export default async function PartnersIndex() {
  await requireAdmin();
  const partners = await prisma.partner.findMany({ orderBy: { orderIndex: 'asc' } });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Partenaires</h1>
        <Link href="/admin/partners/new" className="btn-primary text-sm">+ Nouveau partenaire</Link>
      </div>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2.5">Nom</th><th className="px-4 py-2.5">URL</th><th className="px-4 py-2.5">Catégorie</th><th className="px-4 py-2.5">Order</th><th className="px-4 py-2.5">Actif</th><th className="px-4 py-2.5 text-right">Actions</th></tr></thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-2.5">{p.name}</td>
                <td className="px-4 py-2.5 text-xs"><a href={p.url ?? '#'} className="text-primary hover:underline" target="_blank" rel="noopener">{p.url ?? '—'}</a></td>
                <td className="px-4 py-2.5 text-xs">{p.category ?? '—'}</td>
                <td className="px-4 py-2.5">{p.orderIndex}</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${p.active ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>{p.active ? 'OUI' : 'NON'}</span></td>
                <td className="px-4 py-2.5 text-right text-xs">
                  <form action={deletePartner.bind(null, p.id)} className="inline"><button className="text-danger hover:underline">Suppr.</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
