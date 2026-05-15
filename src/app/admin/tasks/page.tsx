import Link from 'next/link';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { moveTask, deleteTask } from './actions';
import SubmitButton from '@/components/admin/SubmitButton';

export const metadata = { title: 'Tâches | Sun City Admin' };

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO',        label: 'À faire' },
  { status: 'IN_PROGRESS', label: 'En cours' },
  { status: 'REVIEW',      label: 'Review' },
  { status: 'DONE',        label: 'Terminé' },
  { status: 'ARCHIVED',    label: 'Archivé' },
];

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW:    'text-textMuted',
  MEDIUM: 'text-text',
  HIGH:   'text-warning',
  URGENT: 'text-danger',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: 'Basse', MEDIUM: 'Normale', HIGH: 'Haute', URGENT: 'Urgente',
};

export default async function TasksPage() {
  await requireAdmin();

  const tasks = await prisma.task.findMany({
    include: { assignedTo: { select: { name: true } } },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);
  const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' });

  return (
    <div className="py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-text">Tableau de bord des tâches</h1>
        <Link href="/admin/tasks/new" className="btn-primary text-sm">+ Nouvelle tâche</Link>
      </div>

      <div className="grid grid-cols-5 gap-4 min-h-[60vh]">
        {COLUMNS.map(({ status, label }) => (
          <div key={status} className="flex flex-col gap-3">
            <div className="eyebrow mb-1">{label} ({byStatus(status).length})</div>

            {byStatus(status).map((task) => (
              <div key={task.id} className="bg-bgAlt border border-border rounded-lg p-3 space-y-2">
                <Link
                  href={`/admin/tasks/${task.id}`}
                  className={`block text-sm font-semibold text-text hover:text-primary ${PRIORITY_COLOR[task.priority]}`}
                >
                  {task.title}
                </Link>

                <div className="flex items-center justify-between text-xs text-textMuted">
                  <span>{PRIORITY_LABEL[task.priority]}</span>
                  {task.dueAt && <span>📅 {fmt.format(task.dueAt)}</span>}
                </div>
                {task.assignedTo && (
                  <p className="text-xs text-textMuted">👤 {task.assignedTo.name}</p>
                )}

                {/* Move buttons */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {COLUMNS.filter((c) => c.status !== status).map((c) => (
                    <form
                      key={c.status}
                      action={async () => {
                        'use server';
                        await moveTask(task.id, c.status);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-[10px] px-1.5 py-0.5 border border-border rounded hover:bg-bg text-textMuted"
                      >
                        → {c.label}
                      </button>
                    </form>
                  ))}
                  <form
                    action={async () => {
                      'use server';
                      await deleteTask(task.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-[10px] px-1.5 py-0.5 border border-danger/40 rounded text-danger hover:bg-danger/10"
                    >
                      🗑
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
