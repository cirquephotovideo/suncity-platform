import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export default async function OrdersIndex() {
  await requireAdmin();
  const orders = await prisma.order.findMany({ include: { items: { include: { product: { include: { translations: { where: { locale: 'fr' } } } } } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Commandes</h1>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2.5">N°</th><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Email</th><th className="px-4 py-2.5">Items</th><th className="px-4 py-2.5">Total</th><th className="px-4 py-2.5">Statut</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-mono text-xs">{o.number}</td>
                <td className="px-4 py-2.5 text-xs">{o.createdAt.toLocaleString('fr-FR')}</td>
                <td className="px-4 py-2.5">{o.email}</td>
                <td className="px-4 py-2.5 text-xs">{o.items.map(i => `${i.quantity}× ${i.product.translations[0]?.title ?? i.product.slug}`).join(' · ')}</td>
                <td className="px-4 py-2.5 text-primary">{(o.totalCents / 100).toFixed(2)} €</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${o.status === 'PAID' ? 'bg-success/20 text-success' : o.status === 'FAILED' ? 'bg-danger/20 text-danger' : 'bg-textMuted/20 text-textMuted'}`}>{o.status}</span></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-textMuted italic">Aucune commande pour le moment.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-textMuted mt-4">Création de commande via Stripe Checkout : V1.5 (page publique \`/billetterie\` à brancher).</p>
    </div>
  );
}
