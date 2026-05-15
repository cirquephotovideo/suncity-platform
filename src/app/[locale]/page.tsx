import { Link } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/EventCard';
import { LocationCard } from '@/components/LocationCard';
import NewsletterForm from '@/components/NewsletterForm';
import { GalleryScroll } from '@/components/GalleryScroll';
import { ChevronDown, Clock, MapPin, Phone, Sparkles } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  return { title: `${tSite('name')} — ${t('heroTitle')}`, description: t('heroBody') };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tSite = await getTranslations('site');

  const [locations, recurring, settings, articles, partners] = await Promise.all([
    prisma.location.findMany({
      where: { active: true },
      include: { translations: { where: { locale: locale as any } } },
      orderBy: { orderIndex: 'asc' },
      take: 5,
    }),
    prisma.recurringEvent.findMany({
      where: { active: true },
      include: { translations: { where: { locale: locale as any } } },
      orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
    }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.article.findMany({ where: { status: 'PUBLISHED', locale: locale as any }, orderBy: { publishedAt: 'desc' }, take: 3 }).catch(() => []),
    prisma.partner.findMany({ where: { active: true }, orderBy: { orderIndex: 'asc' } }),
  ]);

  const sisterVenues = partners.filter(p => p.category === 'sister-venue');
  const otherPartners = partners.filter(p => p.category !== 'sister-venue');

  return (
    <>
      {/* ─── Hero rotatif scroll-snap (5 slides) ─── */}
      <div className="snap-y snap-mandatory overflow-y-auto h-screen -mt-16">
        <HeroSlide
          eyebrow={t('heroEyebrow')}
          title={t('heroTitle')}
          body={t('heroBody')}
          ctas={[
            { label: t('heroCtaAgenda'), href: '/agenda', variant: 'primary' },
            { label: t('heroCtaTariffs'), href: '/tarifs', variant: 'outline' },
          ]}
          gradient="from-bgAlt via-bg to-bg"
          showChevron
        />
        <HeroSlide
          eyebrow="3000 m² · 3 étages"
          title={locale === 'fr' ? "Sauna · Hammam · Piscine · Jacuzzi" : "Sauna · Steam · Pool · Jacuzzi"}
          body={locale === 'fr' ? "5 zones pensées pour la détente, le sport et la drague." : "5 zones designed for relaxation, sport and cruising."}
          ctas={[{ label: locale === 'fr' ? "Voir les espaces" : "See the spaces", href: '/lieux', variant: 'primary' }]}
          gradient="from-secondary/40 via-bg to-bg"
          showChevron
        />
        <HeroSlide
          eyebrow={locale === 'fr' ? "Ouvert 7/7" : "Open 7/7"}
          title={locale === 'fr' ? "12h → 2h, 6h ven/sam" : "12pm → 2am, 6am Fri/Sat"}
          body={settings?.address ?? tSite('address')}
          ctas={[{ label: locale === 'fr' ? "Horaires & accès" : "Hours & access", href: '/horaires-acces', variant: 'primary' }]}
          gradient="from-primary/20 via-bg to-bg"
          showChevron
        />
        <HeroSlide
          eyebrow={t('agendaTitle')}
          title={locale === 'fr' ? "Une nouvelle soirée chaque jour" : "A new night every day"}
          body={locale === 'fr' ? "Lundi 18€ · Mardi Nasty Boys · Mer Bollywood · Jeu Happy Hour · Ven Dépistage · Sam Bears · Dim GTD" : "Mon €18 · Tue Nasty Boys · Wed Bollywood · Thu Happy Hour · Fri Screening · Sat Bears · Sun GTD"}
          ctas={[{ label: t('heroCtaAgenda'), href: '/agenda', variant: 'primary' }]}
          gradient="from-primary/40 via-secondary/20 to-bg"
          showChevron
        />
        <HeroSlide
          eyebrow={locale === 'fr' ? "En ligne" : "Online"}
          title={locale === 'fr' ? "Réserve ton entrée" : "Book your entry"}
          body={locale === 'fr' ? "Évite la file. Paie en 1 clic. Reçois ton QR. Scan à l'arrivée." : "Skip the queue. Pay in 1 click. Get your QR. Scan on arrival."}
          ctas={[{ label: locale === 'fr' ? "Voir la billetterie" : "See tickets", href: '/billetterie' as any, variant: 'primary' }]}
          gradient="from-emerald-900/30 via-bg to-bg"
        />
      </div>

      {/* ─── Infos pratiques ─── */}
      <section className="section grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard icon={<Clock className="w-6 h-6 text-primary" />} title={t('openingTitle')} body={t('openingNote')} />
        <InfoCard icon={<MapPin className="w-6 h-6 text-primary" />} title={tSite('addressShort')} body={settings?.address ?? tSite('address')} />
        <InfoCard icon={<Phone className="w-6 h-6 text-primary" />} title={tSite('phone')}>
          <a href={`tel:${(settings?.contactPhone ?? tSite('phone')).replace(/\s/g, '')}`} className="text-sm text-primary">{settings?.contactPhone ?? tSite('phone')}</a>
        </InfoCard>
      </section>

      {/* ─── 5 lieux ─── */}
      <section className="section">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Sun City</p>
          <h2 className="font-display text-4xl md:text-5xl">{t('placesTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => {
            const tr = loc.translations[0];
            return tr ? <LocationCard key={loc.id} slug={loc.slug} title={tr.title} summary={tr.summary} iconKey={loc.iconKey} /> : null;
          })}
        </div>
      </section>

      {/* ─── Agenda hebdo (8 cards) ─── */}
      <section className="section">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8">
          <div>
            <p className="eyebrow mb-3">Agenda</p>
            <h2 className="font-display text-4xl md:text-5xl">{t('agendaTitle')}</h2>
          </div>
          <Link href="/agenda" className="text-primary text-sm hover:text-accent">{t('agendaCta')} →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recurring.slice(0, 8).map((r) => {
            const tr = r.translations[0];
            return tr ? (
              <EventCard key={r.id} title={tr.title} summary={tr.summary} dayOfWeek={r.dayOfWeek as any}
                weekOfMonth={r.weekOfMonth as any} startTime={r.startTime} endTime={r.endTime}
                priceLabel={r.priceLabel} hostedBy={r.hostedBy} externalUrl={r.externalUrl} />
            ) : null;
          })}
        </div>
      </section>

      {/* ─── Actualités (si dispo) ─── */}
      {articles.length > 0 && (
        <section className="section">
          <p className="eyebrow mb-3">{locale === 'fr' ? 'Actualités' : 'News'}</p>
          <h2 className="font-display text-4xl md:text-5xl mb-8">{locale === 'fr' ? 'Dernières nouvelles' : 'Latest news'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.map(a => (
              <Link key={a.id} href={`/blog/${a.slug}` as any} className="bg-bgAlt border border-border rounded-lg p-5 hover:border-primary/60 transition">
                {a.publishedAt && <p className="text-xs text-textMuted mb-2">{a.publishedAt.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                <h3 className="font-display text-xl text-primary mb-2">{a.title}</h3>
                {a.excerpt && <p className="text-sm text-textMuted line-clamp-3">{a.excerpt}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Notre groupe (Star City + autres établissements) ─── */}
      {sisterVenues.length > 0 && (
        <section className="section">
          <div className="bg-gradient-to-br from-primary/15 via-bgAlt to-secondary/10 border border-border rounded-xl p-8 md:p-12">
            <p className="eyebrow mb-3">{locale === 'fr' ? 'Notre groupe' : 'Our group'}</p>
            <h2 className="font-display text-3xl md:text-4xl mb-3">{locale === 'fr' ? 'Les autres établissements' : 'Sister venues'}</h2>
            <p className="text-textMuted mb-8 max-w-2xl">{locale === 'fr' ? 'Sun City fait partie d’un groupe d’établissements gay friendly à Paris.' : 'Sun City is part of a group of gay-friendly venues in Paris.'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sisterVenues.map(v => (
                <a key={v.id} href={v.url ?? '#'} target="_blank" rel="noopener noreferrer"
                   className="bg-bg/60 border border-border rounded-lg p-5 hover:border-primary transition">
                  {v.logoUrl && <img src={v.logoUrl} alt={v.name} className="h-12 mb-3 object-contain" />}
                  <h3 className="font-display text-xl text-primary">{v.name}</h3>
                  <p className="text-xs text-textMuted mt-1">{locale === 'fr' ? 'Visiter le site' : 'Visit website'} ↗</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Partenaires (prevention + media) ─── */}
      {otherPartners.length > 0 && (
        <section className="section">
          <p className="eyebrow text-center mb-3">{locale === 'fr' ? 'Partenaires prévention' : 'Prevention partners'}</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-80">
            {otherPartners.map(p => (
              <a key={p.id} href={p.url ?? '#'} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition">
                {p.logoUrl ? <img src={p.logoUrl} alt={p.name} className="h-10 object-contain grayscale hover:grayscale-0 transition" /> : <span className="font-display text-lg">{p.name}</span>}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ─── Galerie scroll auto ─── */}
      <section className="section">
        <p className="eyebrow mb-3">{locale === 'fr' ? 'Galerie' : 'Gallery'}</p>
        <h2 className="font-display text-4xl md:text-5xl mb-8">{locale === 'fr' ? 'Le sauna en images' : 'The sauna in pictures'}</h2>
        <GalleryScroll limit={20} />
      </section>

      {/* ─── Newsletter ─── */}
      <section className="section">
        <div className="bg-bgAlt border border-border rounded-xl p-8 md:p-12 max-w-2xl mx-auto text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="font-display text-3xl mb-2">{t('newsletterTitle')}</h2>
          <p className="text-textMuted mb-6">{t('newsletterBody')}</p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}

function HeroSlide({ eyebrow, title, body, ctas, gradient, showChevron }: {
  eyebrow: string;
  title: string;
  body: string;
  ctas?: { label: string; href: string; variant: 'primary' | 'outline' }[];
  gradient: string;
  showChevron?: boolean;
}) {
  return (
    <section className={`snap-start h-screen w-full relative flex items-center justify-center text-center overflow-hidden bg-gradient-to-b ${gradient}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.15),transparent_60%)]" />
      <div className="relative z-10 max-w-4xl px-6">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl mb-6 leading-[0.95] tracking-tight">{title}</h1>
        <p className="text-lg md:text-xl text-textMuted max-w-2xl mx-auto mb-8">{body}</p>
        {ctas && (
          <div className="flex flex-wrap gap-3 justify-center">
            {ctas.map((c, i) => (
              <Link key={i} href={c.href as any} className={c.variant === 'primary' ? 'btn-primary' : 'btn-outline'}>{c.label}</Link>
            ))}
          </div>
        )}
      </div>
      {showChevron && (
        <ChevronDown className="absolute bottom-8 left-1/2 -translate-x-1/2 w-6 h-6 text-primary animate-bounce" />
      )}
    </section>
  );
}

function InfoCard({ icon, title, body, children }: { icon: React.ReactNode; title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div className="bg-bgAlt border border-border rounded-lg p-5 flex items-start gap-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="font-semibold mb-1">{title}</p>
        {body && <p className="text-sm text-textMuted leading-relaxed">{body}</p>}
        {children}
      </div>
    </div>
  );
}
