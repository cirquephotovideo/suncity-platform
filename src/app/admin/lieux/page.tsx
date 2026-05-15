import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteLocation } from './actions';

export default async function LieuxIndex() {
  await requireAdmin();
  const locs = await prisma.location.findMany({ include: { translations: { where: { locale: 'fr' } } }, orderBy: { orderIndex: 'asc' } });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Lieux internes</h1>
        <Link href="/admin/lieux/new" className="btn-primary text-sm">+ Nouveau lieu</Link>
      </div>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2.5">Slug</th><th className="px-4 py-2.5">Titre FR</th><th className="px-4 py-2.5">Order</th><th className="px-4 py-2.5">Actif</th><th className="px-4 py-2.5 text-right">Actions</th></tr></thead>
          <tbody>
            {locs.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-mono text-xs">{l.slug}</td>
                <td className="px-4 py-2.5">{l.translations[0]?.title ?? '—'}</td>
                <td className="px-4 py-2.5">{l.orderIndex}</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${l.active ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>{l.active ? 'OUI' : 'NON'}</span></td>
                <td className="px-4 py-2.5 text-right space-x-2 text-xs">
                  <Link href={`/admin/lieux/${l.id}`} className="text-primary hover:underline">Éditer</Link>
                  <form action={deleteLocation.bind(null, l.id)} className="inline"><button className="text-danger hover:underline">Suppr.</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
