import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteBanner } from './actions';

export default async function BannersIndex() {
  await requireAdmin();
  const banners = await prisma.banner.findMany({
    include: { translations: { where: { locale: 'fr' } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Bannières hero & marquee</h1>
        <Link href="/admin/banners/new" className="btn-primary text-sm">+ Nouvelle bannière</Link>
      </div>
      <p className="text-sm text-textMuted mb-4">
        <strong>position : top</strong> = bandeau scroll en haut · <strong>hero</strong> = slide hero principale · <strong>agenda-banner</strong> = au-dessus de l'agenda.
      </p>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left">
            <tr>
              <th className="px-4 py-2.5">Slug</th>
              <th className="px-4 py-2.5">Position</th>
              <th className="px-4 py-2.5">Titre FR</th>
              <th className="px-4 py-2.5">Validité</th>
              <th className="px-4 py-2.5">Actif</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map(b => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-mono text-xs">{b.slug}</td>
                <td className="px-4 py-2.5"><span className="text-xs bg-bg rounded px-2 py-0.5">{b.position}</span></td>
                <td className="px-4 py-2.5">{b.translations[0]?.title ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs text-textMuted">{b.startsAt ? b.startsAt.toLocaleDateString('fr-FR') : '∞'} → {b.endsAt ? b.endsAt.toLocaleDateString('fr-FR') : '∞'}</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${b.active ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>{b.active ? 'OUI' : 'NON'}</span></td>
                <td className="px-4 py-2.5 text-right space-x-2 text-xs">
                  <Link href={`/admin/banners/${b.id}`} className="text-primary hover:underline">Éditer</Link>
                  <form action={deleteBanner.bind(null, b.id)} className="inline"><button className="text-danger hover:underline">Suppr.</button></form>
                </td>
              </tr>
            ))}
            {banners.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-textMuted italic">Aucune bannière. <Link href="/admin/banners/new" className="text-primary">En créer une.</Link></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
