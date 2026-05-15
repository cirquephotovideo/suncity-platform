
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { EventCard } from './EventCard';
import { LocationCard } from './LocationCard';
import ContactForm from './ContactForm';
import NewsletterForm from './NewsletterForm';

export async function PageBlocks({ pageId, locale }: { pageId: string; locale: string }) {
  const blocks = await prisma.pageBlock.findMany({ where: { pageId, visible: true }, orderBy: { orderIdx: 'asc' } });
  if (blocks.length === 0) return null;

  return (
    <div>
      {await Promise.all(blocks.map(async b => <div key={b.id}>{await renderBlock(b.kind, b.dataJson as any, locale)}</div>))}
    </div>
  );
}

async function renderBlock(kind: string, data: any, locale: string): Promise<any> {
  switch (kind) {
    case 'HERO_VIDEO':
    case 'HERO_IMAGE':
      return (
        <section className="relative h-[70vh] flex items-center justify-center text-center overflow-hidden">
          {data.videoUrl && <video src={data.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" autoPlay muted loop playsInline />}
          {data.imageUrl && !data.videoUrl && <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${data.imageUrl})` }} />}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 to-bg" />
          <div className="relative z-10 max-w-3xl px-6">
            {data.eyebrow && <p className="eyebrow mb-3">{data.eyebrow}</p>}
            <h2 className="font-display text-4xl md:text-6xl mb-4">{data.title}</h2>
            {data.body && <p className="text-lg text-textMuted mb-6">{data.body}</p>}
            {data.ctaLabel && data.ctaHref && <Link href={data.ctaHref} className="btn-primary">{data.ctaLabel}</Link>}
          </div>
        </section>
      );
    case 'TEXT':
      return <section className="section max-w-prose"><div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: data.html ?? '' }} /></section>;
    case 'IMAGE':
      return <section className="section"><figure><img src={data.src} alt={data.alt ?? ''} className="rounded-lg" />{data.caption && <figcaption className="text-xs text-textMuted text-center mt-2">{data.caption}</figcaption>}</figure></section>;
    case 'CTA':
      return <section className="section text-center"><Link href={data.href ?? '/'} className="btn-primary">{data.label ?? 'Voir'}</Link></section>;
    case 'EVENT_LIST': {
      const recurring = await prisma.recurringEvent.findMany({
        where: { active: true },
        include: { translations: { where: { locale: locale as any } } },
        orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
        take: data.limit ?? 8,
      });
      return (
        <section className="section">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recurring.map(r => {
              const tr = r.translations[0];
              return tr ? <EventCard key={r.id} title={tr.title} summary={tr.summary} dayOfWeek={r.dayOfWeek as any} weekOfMonth={r.weekOfMonth as any} startTime={r.startTime} endTime={r.endTime} priceLabel={r.priceLabel} hostedBy={r.hostedBy} externalUrl={r.externalUrl} /> : null;
            })}
          </div>
        </section>
      );
    }
    case 'LOCATION_LIST': {
      const locs = await prisma.location.findMany({
        where: { active: true },
        include: { translations: { where: { locale: locale as any } } },
        orderBy: { orderIndex: 'asc' },
        take: data.limit ?? 5,
      });
      return (
        <section className="section">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locs.map(l => {
              const tr = l.translations[0];
              return tr ? <LocationCard key={l.id} slug={l.slug} title={tr.title} summary={tr.summary} iconKey={l.iconKey} /> : null;
            })}
          </div>
        </section>
      );
    }
    case 'CONTACT_FORM':    return <section className="section max-w-xl"><ContactForm /></section>;
    case 'NEWSLETTER_FORM': return <section className="section max-w-xl"><NewsletterForm /></section>;
    case 'RAW_HTML':        return <section className="section"><div dangerouslySetInnerHTML={{ __html: data.html ?? '' }} /></section>;
    case 'EMBED':           return <section className="section"><iframe src={data.url} className="w-full rounded-lg" style={{ height: data.height ?? 480 }} loading="lazy" /></section>;
    default: return null;
  }
}
