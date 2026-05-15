import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getActiveBanners(position: string) {
  try {
    const now = new Date();
    return await prisma.banner.findMany({
      where: {
        active: true,
        position,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: null },
          { startsAt: null, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: { gte: now } },
        ],
      },
      include: { translations: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch { return []; }
}

export async function TopMarquee({ locale }: { locale: string }) {
  const banners = await getActiveBanners('top');
  if (banners.length === 0) return null;

  // On répète le contenu pour un effet marquee continu
  const items = banners.flatMap(b => b.translations.filter(t => t.locale === locale));
  if (items.length === 0) return null;

  const content = items.map(it => it.title).join(' · ');
  const repeated = Array.from({ length: 3 }, (_, i) => (
    <span key={i} className="px-8 whitespace-nowrap">{content}</span>
  ));

  return (
    <div className="bg-primary text-bg overflow-hidden text-xs font-medium py-2">
      <div className="flex animate-marquee">{repeated}{repeated}</div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
}
