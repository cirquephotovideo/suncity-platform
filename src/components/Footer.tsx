import { Link } from '@/i18n/routing';
import { getTranslations, getLocale } from 'next-intl/server';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone, Heart } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import NewsletterForm from './NewsletterForm';

async function getSettings() {
  try { return await prisma.siteSettings.findUnique({ where: { id: 1 } }); }
  catch { return null; }
}

async function getSisterVenues() {
  try { return await prisma.partner.findMany({ where: { active: true, category: 'sister-venue' }, orderBy: { orderIndex: 'asc' }, take: 5 }); }
  catch { return []; }
}

export default async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tSite = await getTranslations('site');
  const settings = await getSettings();
  const social = (settings?.socialJson as any) || {};
  const sisterVenues = await getSisterVenues();

  return (
    <footer className="border-t border-border bg-bgAlt mt-32">
      {/* Hashtag bandeau */}
      <div className="text-center py-12 border-b border-border">
        <p className="font-display text-3xl md:text-4xl text-primary tracking-tight">#SunCityParis</p>
        <p className="text-sm text-textMuted mt-3 max-w-xl mx-auto px-4">
          {locale === 'fr'
            ? "Le plus grand sauna gay de Paris depuis 30 ans. 3000 m² · 3 étages · ouvert 7/7."
            : "Paris' largest gay sauna for 30 years. 3000 sqm · 3 floors · open 7/7."}
        </p>
        <div className="flex gap-4 justify-center mt-5 text-primary">
          {social.facebook && <a href={social.facebook} aria-label="Facebook" className="hover:text-accent transition"><Facebook className="w-5 h-5" /></a>}
          {social.instagram && <a href={social.instagram} aria-label="Instagram" className="hover:text-accent transition"><Instagram className="w-5 h-5" /></a>}
          {social.twitter && <a href={social.twitter} aria-label="Twitter" className="hover:text-accent transition"><Twitter className="w-5 h-5" /></a>}
          {social.youtube && <a href={social.youtube} aria-label="YouTube" className="hover:text-accent transition"><Youtube className="w-5 h-5" /></a>}
        </div>
      </div>

      {/* 5 colonnes */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg text-primary mb-3">{tSite('name')}</p>
          <ul className="space-y-2 text-textMuted">
            <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><span>{tSite('addressShort')}</span></li>
            <li className="flex items-start gap-2"><Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><a href={`tel:${tSite('phone').replace(/\s/g,'')}`} className="hover:text-primary">{tSite('phone')}</a></li>
            <li className="flex items-start gap-2"><Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><a href="mailto:contact@suncity-paris.fr" className="hover:text-primary">contact@suncity-paris.fr</a></li>
          </ul>
          <p className="text-xs text-textMuted mt-4">{t('openingHours')}</p>
        </div>

        <div>
          <p className="eyebrow mb-3">{locale === 'fr' ? 'Le sauna' : 'The sauna'}</p>
          <ul className="space-y-2">
            <li><Link href="/lieux" className="hover:text-primary">{tNav('places')}</Link></li>
            <li><Link href="/agenda" className="hover:text-primary">{tNav('agenda')}</Link></li>
            <li><Link href="/tarifs" className="hover:text-primary">{tNav('tariffs')}</Link></li>
            <li><Link href="/horaires-acces" className="hover:text-primary">{tNav('schedule')}</Link></li>
            <li><Link href="/checkin" className="hover:text-primary">{tNav('checkin')}</Link></li>
            <li><Link href="/reglement" className="hover:text-primary">{tNav('rules')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">{locale === 'fr' ? 'Ressources' : 'Resources'}</p>
          <ul className="space-y-2">
            <li><Link href="/galerie" className="hover:text-primary">{tNav('gallery')}</Link></li>
            <li><Link href="/blog" className="hover:text-primary">{tNav('blog')}</Link></li>
            <li><Link href="/affiches" className="hover:text-primary">{locale === 'fr' ? 'Affiches' : 'Posters'}</Link></li>
            <li><Link href="/billetterie" className="hover:text-primary">{locale === 'fr' ? 'Billetterie' : 'Tickets'}</Link></li>
            <li><Link href="/cartes-cadeau" className="hover:text-primary">{locale === 'fr' ? 'Cartes cadeau' : 'Gift cards'}</Link></li>
            <li><Link href="/partenaires" className="hover:text-primary">{tNav('partners')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">{locale === 'fr' ? 'Mon compte' : 'My account'}</p>
          <ul className="space-y-2">
            <li><Link href="/contact" className="hover:text-primary">{tNav('contact')}</Link></li>
            <li><Link href="/newsletter" className="hover:text-primary">{tNav('newsletter')}</Link></li>
            <li><Link href="/mentions-legales" className="hover:text-primary">{tNav('legal')}</Link></li>
            <li><Link href="/rgpd" className="hover:text-primary">{tNav('privacy')}</Link></li>
            <li><a href="/admin/login" className="hover:text-primary">⚙️ {locale === 'fr' ? 'Espace admin' : 'Admin'}</a></li>
          </ul>
          {sisterVenues.length > 0 && (
            <>
              <p className="eyebrow mt-6 mb-2">{locale === 'fr' ? 'Notre groupe' : 'Our group'}</p>
              <ul className="space-y-2">
                {sisterVenues.map(v => (
                  <li key={v.id}><a href={v.url ?? '#'} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{v.name} ↗</a></li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="col-span-2 md:col-span-1">
          <p className="eyebrow mb-3">{t('socialTitle')}</p>
          <p className="text-xs text-textMuted mb-3">
            {locale === 'fr'
              ? 'Soirées, agendas, offres en avant-première. 1 email max / semaine.'
              : 'Nights, schedules, offers in advance. Max 1 email / week.'}
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-border py-5 text-center text-xs text-textMuted px-4 flex flex-col md:flex-row justify-between items-center gap-2 max-w-6xl mx-auto">
        <p>© {new Date().getFullYear()} {tSite('name')} — {t('rcs')}</p>
        <p className="flex items-center gap-1">
          {locale === 'fr' ? 'Site adulte' : 'Adult website'} · 18+ · {locale === 'fr' ? 'Hommes uniquement' : 'Men only'}
        </p>
      </div>
    </footer>
  );
}
