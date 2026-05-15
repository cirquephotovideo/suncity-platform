import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export const metadata = { title: 'Time Machine | Sun City Admin' };

const ACTION_ICON: Record<string, string> = {
  CREATE:    '➕',
  UPDATE:    '✏️',
  DELETE:    '🗑️',
  PUBLISH:   '📤',
  UNPUBLISH: '📥',
  LOGIN:     '🔓',
  LOGOUT:    '🔒',
  LOGIN_FAIL:'⛔',
  EXPORT:    '📋',
  IMPORT:    '📦',
};

function getIcon(action: string): string {
  return ACTION_ICON[action] ?? '📌';
}

function groupByDay(logs: AuditLogEntry[]): Record<string, AuditLogEntry[]> {
  const groups: Record<string, AuditLogEntry[]> = {};
  for (const log of logs) {
    const day = log.createdAt.toISOString().split('T')[0];
    (groups[day] ??= []).push(log);
  }
  return groups;
}

type AuditLogEntry = {
  id: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  diffJson: any;
  createdAt: Date;
  actor?: { name: string | null; email: string | null } | null;
};

export default async function TimeMachinePage({
  searchParams,
}: {
  searchParams?: { actor?: string; targetType?: string; action?: string };
}) {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const where: Record<string, unknown> = { createdAt: { gte: since } };
  if (searchParams?.actor)      where.actorId    = searchParams.actor;
  if (searchParams?.targetType) where.targetType = searchParams.targetType;
  if (searchParams?.action)     where.action     = searchParams.action;

  const logs = (await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    take: 500,
    include: { actor: { select: { name: true, email: true } } },
  })) as unknown as AuditLogEntry[];

  const grouped = groupByDay(logs);
  const days = Object.keys(grouped).sort();

  const actors = await prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } });
  const targetTypes = [...new Set(logs.map((l) => l.targetType))].sort();
  const actions = [...new Set(logs.map((l) => l.action))].sort();

  const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });
  const fmtTime = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'medium' });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <h1 className="font-display text-2xl text-text">Time Machine — 30 derniers jours</h1>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select name="actor" defaultValue={searchParams?.actor ?? ''} className="bg-bg border border-border rounded px-3 py-1.5 text-text text-sm">
          <option value="">Tous les acteurs</option>
          {actors.map((u) => (
            <option key={u.id} value={u.id}>{u.name ?? u.email ?? u.id}</option>
          ))}
        </select>
        <select name="targetType" defaultValue={searchParams?.targetType ?? ''} className="bg-bg border border-border rounded px-3 py-1.5 text-text text-sm">
          <option value="">Tous les types</option>
          {targetTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select name="action" defaultValue={searchParams?.action ?? ''} className="bg-bg border border-border rounded px-3 py-1.5 text-text text-sm">
          <option value="">Toutes les actions</option>
          {actions.map((a) => <option key={a} value={a}>{getIcon(a)} {a}</option>)}
        </select>
        <button type="submit" className="btn-primary text-sm px-4 py-1.5">Filtrer</button>
        <a href="/admin/time-machine" className="btn-outline text-sm px-4 py-1.5">Reset</a>
      </form>

      {days.length === 0 && (
        <p className="text-textMuted text-sm">Aucun événement trouvé.</p>
      )}

      {days.map((day) => (
        <div key={day} className="space-y-3">
          <h2 className="eyebrow border-b border-border pb-1">
            {fmt.format(new Date(day + 'T12:00:00Z'))}
          </h2>

          <div className="relative ml-4 border-l-2 border-border pl-6 space-y-4">
            {grouped[day].map((log) => (
              <div key={log.id} className="relative">
                {/* Timeline dot */}
                <span className="absolute -left-[1.85rem] top-1 w-5 h-5 flex items-center justify-center bg-bgAlt border border-border rounded-full text-xs">
                  {getIcon(log.action)}
                </span>

                <div className="bg-bgAlt border border-border rounded-lg px-4 py-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="inline-block text-xs font-mono bg-bg border border-border rounded px-1.5 py-0.5 text-primary mr-2">
                        {log.action}
                      </span>
                      <span className="text-sm text-text font-medium">{log.targetType}</span>
                      {log.targetId && (
                        <span className="ml-1 text-xs text-textMuted font-mono">#{log.targetId.slice(0, 8)}</span>
                      )}
                    </div>
                    <span className="text-xs text-textMuted flex-shrink-0">{fmtTime.format(log.createdAt)}</span>
                  </div>
                  {log.actor && (
                    <p className="text-xs text-textMuted mt-1">
                      Par {log.actor.name ?? log.actor.email ?? log.actorId}
                    </p>
                  )}
                  {log.diffJson && (
                    <pre className="mt-2 text-xs text-textMuted bg-bg border border-border rounded p-2 overflow-x-auto">
                      {JSON.stringify(log.diffJson, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
