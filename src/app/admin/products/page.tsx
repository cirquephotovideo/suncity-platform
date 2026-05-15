import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteProduct } from './actions';

export default async function ProductsIndex() {
  await requireAdmin();
  const products = await prisma.product.findMany({ include: { translations: { where: { locale: 'fr' } }, variants: true }, orderBy: { slug: 'asc' } });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Produits billetterie</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm">+ Nouveau produit</Link>
      </div>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2.5">Slug</th><th className="px-4 py-2.5">Type</th><th className="px-4 py-2.5">Titre FR</th><th className="px-4 py-2.5">Variants</th><th className="px-4 py-2.5">Actif</th><th className="px-4 py-2.5 text-right">Actions</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-2.5"><span className="text-xs bg-bg rounded px-2 py-0.5">{p.kind}</span></td>
                <td className="px-4 py-2.5">{p.translations[0]?.title ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs text-textMuted">{p.variants.length} variant(s) · de {Math.min(...p.variants.map(v => v.priceCents)) / 100} € à {Math.max(...p.variants.map(v => v.priceCents)) / 100} €</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${p.active ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>{p.active ? 'OUI' : 'NON'}</span></td>
                <td className="px-4 py-2.5 text-right space-x-2 text-xs">
                  <Link href={`/admin/products/${p.id}`} className="text-primary hover:underline">Éditer</Link>
                  <form action={deleteProduct.bind(null, p.id)} className="inline"><button className="text-danger hover:underline">Suppr.</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
