import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { createSecret, deleteSecret } from './actions';
import SubmitButton from '@/components/admin/SubmitButton';

export const metadata = { title: 'Secrets manager — Sun City Admin' };

export default async function SecretsPage() {
  await requireAdmin();
  const secrets = await prisma.adminSecret.findMany({
    select: { id: true, key: true, description: true, lastUsedAt: true, createdAt: true },
    orderBy: { key: 'asc' },
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">🔑 Secrets manager</h1>
      <p className="text-sm text-textMuted mb-6">
        Stockage chiffré (AES-256-GCM) de secrets API. Pour révéler une valeur,
        utilise <code className="text-primary">npx prisma studio</code> ou les actions admin.
      </p>

      <div className="bg-bgAlt border border-border rounded-lg p-6 mb-6">
        <h2 className="font-display text-lg mb-4">+ Nouveau secret</h2>
        <form action={createSecret} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="key" placeholder="STRIPE_SECRET_KEY" required className="bg-bg border border-border rounded px-3 py-2 font-mono text-sm" />
            <input name="description" placeholder="Description (optionnel)" className="bg-bg border border-border rounded px-3 py-2 text-sm" />
          </div>
          <textarea name="value" rows={3} placeholder="Valeur du secret (chiffré au stockage)" required className="w-full bg-bg border border-border rounded px-3 py-2 text-sm font-mono" />
          <SubmitButton>Créer</SubmitButton>
        </form>
      </div>

      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left">
            <tr>
              <th className="px-4 py-2.5">Clé</th>
              <th className="px-4 py-2.5">Description</th>
              <th className="px-4 py-2.5">Dernière utilisation</th>
              <th className="px-4 py-2.5">Créé</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {secrets.map(s => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-mono text-xs">{s.key}</td>
                <td className="px-4 py-2.5 text-xs">{s.description ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs text-textMuted">{s.lastUsedAt?.toLocaleDateString('fr-FR') ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs text-textMuted">{s.createdAt.toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-2.5 text-right">
                  <form action={deleteSecret.bind(null, s.id)} className="inline">
                    <button className="text-xs text-danger hover:underline">Supprimer</button>
                  </form>
                </td>
              </tr>
            ))}
            {secrets.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-textMuted italic">Aucun secret pour l'instant.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
