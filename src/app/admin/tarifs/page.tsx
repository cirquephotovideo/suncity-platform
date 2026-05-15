import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteTariff } from './actions';

export default async function TarifsIndex() {
  await requireAdmin();
  const tariffs = await prisma.tariff.findMany({ include: { translations: { where: { locale: 'fr' } } }, orderBy: { orderIndex: 'asc' } });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Tarifs porte</h1>
        <Link href="/admin/tarifs/new" className="btn-primary text-sm">+ Nouveau tarif</Link>
      </div>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2.5">Code</th><th className="px-4 py-2.5">Label</th><th className="px-4 py-2.5">Prix</th><th className="px-4 py-2.5">Jours</th><th className="px-4 py-2.5">Actif</th><th className="px-4 py-2.5 text-right">Actions</th></tr></thead>
          <tbody>
            {tariffs.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-mono text-xs">{t.code}</td>
                <td className="px-4 py-2.5">{t.translations[0]?.label ?? '—'}</td>
                <td className="px-4 py-2.5 text-primary">{(t.priceCents / 100).toFixed(2)} €</td>
                <td className="px-4 py-2.5 text-xs text-textMuted">{t.daysApplicable.join(', ')}</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${t.active ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>{t.active ? 'OUI' : 'NON'}</span></td>
                <td className="px-4 py-2.5 text-right space-x-2 text-xs">
                  <Link href={`/admin/tarifs/${t.id}`} className="text-primary hover:underline">Éditer</Link>
                  <form action={deleteTariff.bind(null, t.id)} className="inline"><button className="text-danger hover:underline">Suppr.</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
