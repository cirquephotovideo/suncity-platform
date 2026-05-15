import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import DeleteNewsForm from './DeleteNewsForm';

export const metadata = { title: 'Actualités — Sun City Admin' };

export default async function NewsIndex() {
  await requireAdmin();
  // Use FR rows as canonical list
  const rows = await prisma.article.findMany({
    where: { locale: 'fr' as any },
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 200,
  });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Actualités</h1>
        <Link href="/admin/news/new" className="btn-primary text-sm">+ Nouvelle actualité</Link>
      </div>
      <p className="text-sm text-textMuted mb-4">
        Articles bilingues (FR + EN) — programmation, événements, prévention, lifestyle, presse.
      </p>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left">
            <tr>
              <th className="px-4 py-2.5">Titre</th>
              <th className="px-4 py-2.5">Catégorie</th>
              <th className="px-4 py-2.5">Statut</th>
              <th className="px-4 py-2.5">Publication</th>
              <th className="px-4 py-2.5">Pin</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-textMuted text-sm">
                  Aucune actualité — clique sur « + Nouvelle actualité » pour commencer.
                </td>
              </tr>
            )}
            {rows.map(a => (
              <tr key={a.id} className="border-t border-border">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/news/${a.id}/edit`} className="hover:text-primary font-medium">
                    {a.title}
                  </Link>
                  <div className="text-[10px] text-textMuted font-mono">{a.slug}</div>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs bg-bg rounded px-2 py-0.5">{a.category ?? '—'}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    a.status === 'PUBLISHED' ? 'bg-success/20 text-success'
                    : a.status === 'ARCHIVED' ? 'bg-textMuted/20 text-textMuted'
                    : a.scheduledAt ? 'bg-secondary/20 text-secondary'
                    : 'bg-textMuted/20 text-textMuted'
                  }`}>
                    {a.status === 'PUBLISHED' ? 'Publié'
                      : a.scheduledAt ? 'Programmé'
                      : a.status === 'ARCHIVED' ? 'Archivé' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-textMuted">
                  {a.publishedAt
                    ? a.publishedAt.toLocaleDateString('fr-FR')
                    : a.scheduledAt
                    ? `→ ${a.scheduledAt.toLocaleDateString('fr-FR')}`
                    : '—'}
                </td>
                <td className="px-4 py-2.5">{a.pinned ? '📌' : ''}</td>
                <td className="px-4 py-2.5 text-right text-xs space-x-3">
                  <Link href={`/admin/news/${a.id}/edit`} className="text-primary hover:underline">Éditer</Link>
                  <DeleteNewsForm id={a.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
