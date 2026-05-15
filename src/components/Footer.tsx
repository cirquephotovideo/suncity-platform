import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { prisma } from '@/lib/prisma';

async function getSettings() {
  try { return await prisma.siteSettings.findUnique({ where: { id: 1 } }); }
  catch { return null; }
}

export default async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tSite = await getTranslations('site');
  const settings = await getSettings();
  const social = (settings?.socialJson as any) || {};

  return (
    <footer className="border-t border-border bg-bgAlt mt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="font-display text-lg text-primary mb-2">{tSite('name')}</p>
          <p className="text-sm text-textMuted">{tSite('addressShort')}</p>
          <p className="text-sm text-textMuted mt-1">{tSite('phone')}</p>
          <p className="text-xs text-textMuted mt-3">{t('openingHours')}</p>
        </div>
        <div>
          <p className="eyebrow mb-3">{t('infoTitle')}</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/reglement" className="hover:text-primary">{tNav('rules')}</Link></li>
            <li><Link href="/checkin" className="hover:text-primary">{tNav('checkin')}</Link></li>
            <li><Link href="/mentions-legales" className="hover:text-primary">{tNav('legal')}</Link></li>
            <li><Link href="/rgpd" className="hover:text-primary">{tNav('privacy')}</Link></li>
            <li><Link href="/contact" className="hover:text-primary">{tNav('contact')}</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">{t('partnersTitle')}</p>
          <ul className="space-y-2 text-sm">
            <li><a href="https://www.playsafe.fr" rel="noopener noreferrer" className="hover:text-primary">Playsafe</a></li>
            <li><a href="https://www.aremedia.org" rel="noopener noreferrer" className="hover:text-primary">AREMEDIA</a></li>
            <li><a href="https://www.starcity.fr" rel="noopener noreferrer" className="hover:text-primary">Star City</a></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">{t('socialTitle')}</p>
          <div className="flex gap-3">
            {social.facebook && <a href={social.facebook} aria-label="Facebook" className="hover:text-primary"><Facebook className="w-5 h-5" /></a>}
            {social.instagram && <a href={social.instagram} aria-label="Instagram" className="hover:text-primary"><Instagram className="w-5 h-5" /></a>}
            {social.twitter && <a href={social.twitter} aria-label="Twitter" className="hover:text-primary"><Twitter className="w-5 h-5" /></a>}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-textMuted px-4">
        {t('rcs')}
      </div>
    </footer>
  );
}
