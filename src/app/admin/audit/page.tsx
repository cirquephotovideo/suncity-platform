import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export default async function AuditLog({ searchParams }: { searchParams?: Promise<{ targetType?: string; action?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const where: any = {};
  if (sp?.targetType) where.targetType = sp.targetType;
  if (sp?.action) where.action = sp.action;
  const logs = await prisma.auditLog.findMany({ where, include: { actor: { select: { email: true } } }, orderBy: { createdAt: 'desc' }, take: 200 });
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Audit log</h1>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Acteur</th><th className="px-4 py-2">Action</th><th className="px-4 py-2">Cible</th><th className="px-4 py-2">ID</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-2 text-xs">{l.createdAt.toLocaleString('fr-FR')}</td>
                <td className="px-4 py-2 text-xs">{l.actor?.email ?? '—'}</td>
                <td className="px-4 py-2"><span className="text-xs bg-bg rounded px-2 py-0.5">{l.action}</span></td>
                <td className="px-4 py-2 text-xs">{l.targetType}</td>
                <td className="px-4 py-2 font-mono text-xs text-textMuted">{l.targetId ?? '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-textMuted italic">Aucune entrée.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
