import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { publishPage, unpublishPage, deletePage } from './actions';

export default async function PagesIndex() {
  await requireAdmin();
  const pages = await prisma.page.findMany({ orderBy: [{ slug: 'asc' }, { locale: 'asc' }] });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Pages CMS</h1>
        <Link href="/admin/pages/new" className="btn-primary text-sm">+ Nouvelle page</Link>
      </div>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left">
            <tr>
              <th className="px-4 py-2.5">Slug</th>
              <th className="px-4 py-2.5">Locale</th>
              <th className="px-4 py-2.5">Titre</th>
              <th className="px-4 py-2.5">Statut</th>
              <th className="px-4 py-2.5">MAJ</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 bg-bg rounded text-xs">{p.locale}</span></td>
                <td className="px-4 py-2.5">{p.title}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'PUBLISHED' ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>{p.status}</span>
                </td>
                <td className="px-4 py-2.5 text-textMuted text-xs">{p.updatedAt.toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-2.5 text-right space-x-2 text-xs">
                  <Link href={`/admin/pages/${p.id}`} className="text-primary hover:underline">Éditer</Link>
                  <form action={p.status === 'PUBLISHED' ? unpublishPage.bind(null, p.id) : publishPage.bind(null, p.id)} className="inline">
                    <button className="text-textMuted hover:text-primary">{p.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}</button>
                  </form>
                  <form action={deletePage.bind(null, p.id)} className="inline">
                    <button className="text-danger hover:underline">Suppr.</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
