import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteCoupon } from './actions';

export default async function CouponsIndex() {
  await requireAdmin();
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Coupons</h1>
        <Link href="/admin/coupons/new" className="btn-primary text-sm">+ Nouveau coupon</Link>
      </div>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2.5">Code</th><th className="px-4 py-2.5">Type</th><th className="px-4 py-2.5">Valeur</th><th className="px-4 py-2.5">Validité</th><th className="px-4 py-2.5">Utilisé</th><th className="px-4 py-2.5">Actif</th><th className="px-4 py-2.5 text-right">Actions</th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-mono text-xs">{c.code}</td>
                <td className="px-4 py-2.5"><span className="text-xs">{c.kind}</span></td>
                <td className="px-4 py-2.5 text-primary">{c.kind === 'PERCENT' ? `${c.value}%` : `${(c.value / 100).toFixed(2)} €`}</td>
                <td className="px-4 py-2.5 text-xs text-textMuted">{c.validFrom ? c.validFrom.toLocaleDateString('fr-FR') : '∞'} → {c.validUntil ? c.validUntil.toLocaleDateString('fr-FR') : '∞'}</td>
                <td className="px-4 py-2.5 text-xs">{c.redemptions}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${c.active ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>{c.active ? 'OUI' : 'NON'}</span></td>
                <td className="px-4 py-2.5 text-right text-xs">
                  <form action={deleteCoupon.bind(null, c.id)} className="inline"><button className="text-danger hover:underline">Suppr.</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
