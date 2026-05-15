import { prisma } from '@/lib/prisma';
import { publicUrl } from '@/lib/storage';

export async function GalleryScroll({ limit = 20 }: { limit?: number }) {
  const photos = await prisma.photo.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: limit,
  }).catch(() => []);

  if (photos.length === 0) return null;

  // duplicate for infinite scroll effect
  const items = [...photos, ...photos];

  return (
    <div className="relative overflow-hidden">
      <div className="flex gap-3 animate-marquee-h py-2">
        {items.map((p, i) => (
          <div key={`${p.id}-${i}`} className="flex-shrink-0 aspect-[4/5] w-48 md:w-64 rounded-lg overflow-hidden bg-bgAlt border border-border">
            <img src={publicUrl(p.key)} alt={p.alt ?? p.caption ?? ''} className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee-h { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee-h { animation: marquee-h 40s linear infinite; }
        .animate-marquee-h:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}
