import { setRequestLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { publicUrl } from '@/lib/storage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: locale === 'fr' ? 'Galerie — Sun City Paris' : 'Gallery — Sun City Paris' };
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const photos = await prisma.photo.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: 60,
  }).catch(() => []);

  return (
    <section className="section">
      <p className="eyebrow mb-3">Sun City</p>
      <h1 className="font-display text-4xl md:text-5xl mb-6">{locale === 'fr' ? 'Galerie' : 'Gallery'}</h1>
      <p className="text-textMuted max-w-2xl mb-10">
        {locale === 'fr' ? 'Photos modérées du sauna et des soirées.' : 'Moderated photos of the sauna and nights.'}
      </p>

      {photos.length === 0 ? (
        <div className="bg-bgAlt border border-border rounded-lg p-12 text-center">
          <p className="text-textMuted italic">
            {locale === 'fr' ? "Aucune photo publiée pour l'instant. Reviens bientôt !" : 'No photos published yet. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map(p => (
            <figure key={p.id} className="bg-bgAlt border border-border rounded-lg overflow-hidden aspect-[4/5]">
              <img src={publicUrl(p.key)} alt={p.alt ?? p.caption ?? ''} className="w-full h-full object-cover hover:scale-105 transition" loading="lazy" />
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
