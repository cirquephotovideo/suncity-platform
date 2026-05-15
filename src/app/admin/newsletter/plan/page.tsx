import { requireAdmin } from '@/lib/admin-auth';

export const metadata = { title: 'Plan newsletter annuel — Sun City Admin' };

export default async function Page() {
  await requireAdmin();
  return (
    <div>
      <h1 className="font-display text-3xl mb-4">📅 Plan newsletter annuel</h1>
      <p className="text-textMuted mb-6">Calendrier éditorial 12 mois pour les campagnes newsletter.</p>
      <div className="bg-bgAlt border border-border rounded-lg p-6">
        <p className="text-sm text-textMuted">
          🚧 Module fonctionnel — interface CRUD enrichie en cours de port depuis le code GLD.
          En attendant, gère cette section via <code className="text-primary">npx prisma studio</code>.
        </p>
      </div>
    </div>
  );
}
