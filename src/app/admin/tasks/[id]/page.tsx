import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { upsertTask, deleteTask } from '../actions';
import SubmitButton from '@/components/admin/SubmitButton';

export const metadata = { title: 'Éditer tâche | Sun City Admin' };

export default async function EditTaskPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) notFound();

  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } });
  const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' });

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/tasks" className="text-textMuted hover:text-text text-sm">← Retour</Link>
        <h1 className="font-display text-2xl text-text">Éditer la tâche</h1>
      </div>

      <form action={upsertTask} className="bg-bgAlt border border-border rounded-lg p-5 space-y-4">
        <input type="hidden" name="id" value={task.id} />
        <div>
          <label className="block text-sm text-textMuted mb-1">Titre *</label>
          <input
            name="title"
            required
            defaultValue={task.title}
            className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-textMuted mb-1">Description (Markdown)</label>
          <textarea
            name="descriptionMd"
            rows={4}
            defaultValue={task.descriptionMd ?? ''}
            className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm font-mono"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-textMuted mb-1">Statut</label>
            <select name="status" defaultValue={task.status} className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm">
              <option value="TODO">À faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Terminé</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-textMuted mb-1">Priorité</label>
            <select name="priority" defaultValue={task.priority} className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm">
              <option value="LOW">Basse</option>
              <option value="MEDIUM">Normale</option>
              <option value="HIGH">Haute</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-textMuted mb-1">Échéance</label>
          <input
            type="date"
            name="dueAt"
            defaultValue={task.dueAt ? task.dueAt.toISOString().split('T')[0] : undefined}
            className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-textMuted mb-1">Assigné à</label>
          <select name="assignedToId" defaultValue={task.assignedToId ?? ''} className="w-full bg-bg border border-border rounded px-3 py-2 text-text text-sm">
            <option value="">— Personne —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name ?? u.email ?? u.id}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton className="btn-primary">Enregistrer</SubmitButton>
          <form
            action={async () => {
              'use server';
              await deleteTask(task.id);
            }}
          >
            <SubmitButton className="btn-outline text-danger border-danger hover:bg-danger/10">
              Supprimer
            </SubmitButton>
          </form>
        </div>
      </form>

      <p className="text-textMuted text-xs">
        Créée le {fmt.format(task.createdAt)} · Modifiée le {fmt.format(task.updatedAt)}
      </p>
    </div>
  );
}
