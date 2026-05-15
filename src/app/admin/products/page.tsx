import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import DeleteProductForm from './DeleteProductForm';

export const metadata = { title: 'Produits — Sun City Admin' };

export default async function ProductsIndex() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    include: { translations: { where: { locale: 'fr' as any } }, variants: true },
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Produits / Billetterie</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm">+ Nouveau produit</Link>
      </div>
      <p className="text-sm text-textMuted mb-4">
        Billetterie, cartes cadeau, abonnements et produits boutique — variants, stocks et prix Stripe.
      </p>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left">
            <tr>
              <th className="px-4 py-2.5">Produit</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Catégorie</th>
              <th className="px-4 py-2.5">Variants</th>
              <th className="px-4 py-2.5">Actif</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-textMuted text-sm">
                  Aucun produit — clique sur « + Nouveau produit » pour commencer.
                </td>
              </tr>
            )}
            {products.map(p => {
              const prices = p.variants.map(v => v.priceCents).filter(n => n > 0);
              const min = prices.length ? Math.min(...prices) / 100 : 0;
              const max = prices.length ? Math.max(...prices) / 100 : 0;
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/products/${p.id}/edit`} className="hover:text-primary font-medium">
                      {p.translations[0]?.title ?? p.slug}
                    </Link>
                    <div className="text-[10px] text-textMuted font-mono">{p.slug}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-bg rounded px-2 py-0.5">{p.kind}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {p.category ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-textMuted">
                    {p.variants.length} variant(s)
                    {prices.length > 0 && (
                      <> · {min === max ? `${min} €` : `${min} → ${max} €`}</>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded ${p.active ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>
                      {p.active ? 'OUI' : 'NON'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-3 text-xs">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-primary hover:underline">Éditer</Link>
                    <DeleteProductForm id={p.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
