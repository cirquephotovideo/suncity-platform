import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export default async function BannersIndex() {
  await requireAdmin();
  const banners = await prisma.banner.findMany({ include: { translations: { where: { locale: 'fr' } } }, orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Bandeaux promo</h1>
      {banners.length === 0 ? (
        <p className="text-textMuted italic">Aucun bandeau pour le moment. CRUD complet → P4.5+.</p>
      ) : (
        <div className="grid gap-3">{banners.map(b => (
          <div key={b.id} className="bg-bgAlt border border-border rounded p-4">
            <p className="font-mono text-xs text-textMuted">{b.slug} · {b.position}</p>
            <p>{b.translations[0]?.title ?? '—'}</p>
          </div>
        ))}</div>
      )}
    </div>
  );
}
