import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export default async function PageBuilderIndex() {
  await requireAdmin();
  const pages = await prisma.page.findMany({
    orderBy: [{ slug: 'asc' }, { locale: 'asc' }],
    include: { _count: { select: { blocks: true } } },
  });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Page Builder</h1>
        <Link href="/admin/pages/new" className="btn-primary text-sm">+ Nouvelle page</Link>
      </div>
      <p className="text-sm text-textMuted mb-4">Pour chaque page CMS, ajoute des blocs visuels (hero vidéo, galerie, agenda, tarifs, formulaires, raw HTML…) sans code.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pages.map(p => (
          <Link key={p.id} href={`/admin/page-builder/${p.id}`} className="bg-bgAlt border border-border rounded-lg p-4 hover:border-primary/60 transition">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-xs">/{p.locale}/{p.slug}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'PUBLISHED' ? 'bg-success/20 text-success' : 'bg-textMuted/20 text-textMuted'}`}>{p.status}</span>
            </div>
            <h3 className="font-display text-lg">{p.title}</h3>
            <p className="text-xs text-textMuted mt-2">{p._count.blocks} bloc{p._count.blocks > 1 ? 's' : ''}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
