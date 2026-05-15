import { prisma } from '@/lib/prisma';

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

  const items = banners.flatMap(b => b.translations.filter(t => t.locale === locale));
  if (items.length === 0) return null;

  // Effet "neo" : gradient or/cuivre + glow + emojis qui scrollent
  const content = items.map(it => {
    const emoji = it.title.match(/^[\p{Extended_Pictographic}\p{Emoji}]+/u)?.[0] ?? '✨';
    return `${emoji}  ${it.title}    `;
  }).join('•    ');

  return (
    <div className="relative bg-gradient-to-r from-primary via-secondary to-primary overflow-hidden text-bg text-xs font-medium py-2.5 shadow-[0_0_30px_rgba(201,162,75,0.6)]">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
      <div className="relative flex animate-marquee">
        <span className="px-8 whitespace-nowrap font-semibold tracking-wide">{content}</span>
        <span className="px-8 whitespace-nowrap font-semibold tracking-wide">{content}</span>
        <span className="px-8 whitespace-nowrap font-semibold tracking-wide">{content}</span>
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-marquee { animation: marquee 25s linear infinite; }
        .animate-shimmer { animation: shimmer 4s linear infinite; }
      `}</style>
    </div>
  );
}
