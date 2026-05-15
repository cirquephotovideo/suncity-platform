import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import UsersAdmin from '@/components/admin/UsersAdmin';

export const metadata = { title: 'Utilisateurs — Sun City Admin' };

export default async function Page() {
  const session = await requireAdmin();
  const currentUserId = (session.user as any).id as string;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      include: { mfa: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.user.count(),
  ]);

  const initial = items.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    role: u.role,
    image: u.image ?? null,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    suspendedAt: u.suspendedAt ? u.suspendedAt.toISOString() : null,
    has2fa: !!u.mfa,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Utilisateurs</h1>
      <p className="text-textMuted mb-6">Gestion complète : rôles, mot de passe, 2FA, suspension, audit.</p>
      <UsersAdmin initial={initial} total={total} currentUserId={currentUserId} />
    </div>
  );
}
