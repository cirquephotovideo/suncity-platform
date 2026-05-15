import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertProduct, upsertVariant, deleteVariant } from '../actions';
import ProductForm from '@/components/admin/ProductForm';
import SubmitButton from '@/components/admin/SubmitButton';

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = await prisma.product.findUnique({ where: { id }, include: { translations: true, variants: { orderBy: { orderIndex: 'asc' } } } });
  if (!p) notFound();
  const fr = p.translations.find(x => x.locale === 'fr');
  const en = p.translations.find(x => x.locale === 'en');

  async function saveProduct(fd: FormData) { 'use server'; await upsertProduct(id, fd); }
  async function saveVariant(fd: FormData) {
    'use server';
    const variantId = String(fd.get('variantId') ?? '') || null;
    await upsertVariant(id, variantId, fd);
  }

  return (
    <div className="space-y-12">
      <section>
        <h1 className="font-display text-3xl mb-6">{fr?.title ?? p.slug}</h1>
        <ProductForm defaults={{
          slug: p.slug, kind: p.kind, active: p.active, coverImageUrl: p.coverImageUrl ?? '',
          title_fr: fr?.title ?? '', description_fr: fr?.description ?? '',
          title_en: en?.title ?? '', description_en: en?.description ?? '',
        }} action={saveProduct} />
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">Variants ({p.variants.length})</h2>
        <div className="bg-bgAlt border border-border rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2.5">SKU</th><th className="px-4 py-2.5">Label</th><th className="px-4 py-2.5">Prix</th><th className="px-4 py-2.5">Order</th><th className="px-4 py-2.5">Actif</th><th className="px-4 py-2.5 text-right">Actions</th></tr></thead>
            <tbody>
              {p.variants.map((v) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-xs">{v.sku}</td>
                  <td className="px-4 py-2.5">{v.label}</td>
                  <td className="px-4 py-2.5 text-primary">{(v.priceCents / 100).toFixed(2)} €</td>
                  <td className="px-4 py-2.5">{v.orderIndex}</td>
                  <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${v.active ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>{v.active ? 'OUI' : 'NON'}</span></td>
                  <td className="px-4 py-2.5 text-right text-xs">
                    <form action={deleteVariant.bind(null, v.id, id)} className="inline"><button className="text-danger hover:underline">Suppr.</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details className="bg-bgAlt border border-border rounded p-4">
          <summary className="cursor-pointer text-sm">+ Ajouter un variant</summary>
          <form action={saveVariant} className="mt-4 grid grid-cols-2 gap-3">
            <input name="sku" placeholder="SKU unique" required className="bg-bg border border-border rounded px-3 py-2 font-mono" />
            <input name="label" placeholder="Label (Adulte semaine, …)" required className="bg-bg border border-border rounded px-3 py-2" />
            <input name="priceCents" type="number" placeholder="Prix en centimes" required className="bg-bg border border-border rounded px-3 py-2" />
            <input name="orderIndex" type="number" defaultValue={p.variants.length + 1} className="bg-bg border border-border rounded px-3 py-2" />
            <label className="flex items-center gap-2 text-sm col-span-2"><input type="checkbox" name="active" defaultChecked /> Actif</label>
            <SubmitButton>Ajouter variant</SubmitButton>
          </form>
        </details>
      </section>
    </div>
  );
}
