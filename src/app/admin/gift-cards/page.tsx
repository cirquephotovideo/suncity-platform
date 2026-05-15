import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { formatPrice } from '@/lib/format';

export default async function GiftCardsAdmin() {
  await requireAdmin();
  const cards = await prisma.giftCard.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });

  const totalActive = cards.filter(c => c.status === 'ACTIVE').reduce((s, c) => s + c.amountCents, 0);
  const totalRedeemed = cards.filter(c => c.status === 'REDEEMED').reduce((s, c) => s + c.amountCents, 0);

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">🎁 Cartes cadeau</h1>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-bgAlt border border-border rounded-lg p-4">
          <p className="text-xs text-textMuted uppercase">Total émis</p>
          <p className="text-2xl font-display text-primary mt-1">{cards.length}</p>
        </div>
        <div className="bg-bgAlt border border-border rounded-lg p-4">
          <p className="text-xs text-textMuted uppercase">Encours actif</p>
          <p className="text-2xl font-display text-success mt-1">{formatPrice(totalActive)}</p>
        </div>
        <div className="bg-bgAlt border border-border rounded-lg p-4">
          <p className="text-xs text-textMuted uppercase">Utilisé</p>
          <p className="text-2xl font-display text-textMuted mt-1">{formatPrice(totalRedeemed)}</p>
        </div>
      </div>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left">
            <tr><th className="px-4 py-2.5">Code</th><th className="px-4 py-2.5">Acheteur</th><th className="px-4 py-2.5">Destinataire</th><th className="px-4 py-2.5">Montant</th><th className="px-4 py-2.5">Expire</th><th className="px-4 py-2.5">Statut</th></tr>
          </thead>
          <tbody>
            {cards.map(c => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-mono text-xs">{c.code}</td>
                <td className="px-4 py-2.5 text-xs">{c.buyerEmail}</td>
                <td className="px-4 py-2.5 text-xs">{c.recipientEmail ?? '—'}</td>
                <td className="px-4 py-2.5 text-primary">{formatPrice(c.amountCents)}</td>
                <td className="px-4 py-2.5 text-xs text-textMuted">{c.expiresAt?.toLocaleDateString('fr-FR') ?? '—'}</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${c.status === 'ACTIVE' ? 'bg-success/20 text-success' : c.status === 'REDEEMED' ? 'bg-textMuted/20 text-textMuted' : 'bg-warning/20 text-warning'}`}>{c.status}</span></td>
              </tr>
            ))}
            {cards.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-textMuted italic">Aucune carte cadeau pour le moment.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
