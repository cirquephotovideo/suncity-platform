'use client';
import { useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, Globe } from 'lucide-react';

export default function Header() {
  const t = useTranslations('nav');
  const tSite = useTranslations('site');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const otherLocale = locale === 'fr' ? 'en' : 'fr';

  const items = [
    { href: '/', label: t('home') },
    { href: '/agenda', label: t('agenda') },
    { href: '/lieux', label: t('places') },
    { href: '/tarifs', label: t('tariffs') },
    { href: '/horaires-acces', label: t('schedule') },
    { href: '/reglement', label: t('rules') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-bg/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-primary tracking-tight">
          {tSite('name')}
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          {items.map((it) => (
            <Link key={it.href} href={it.href}
              className={`text-sm transition ${pathname === it.href ? 'text-primary' : 'text-text hover:text-primary'}`}>
              {it.label}
            </Link>
          ))}
          <Link href={pathname as any} locale={otherLocale} className="btn-ghost text-xs flex items-center gap-1.5">
            <Globe className="w-4 h-4" /> {otherLocale.toUpperCase()}
          </Link>
        </nav>
        <button className="lg:hidden btn-ghost p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-bgAlt">
          <nav className="px-4 py-4 flex flex-col gap-3">
            {items.map((it) => (
              <Link key={it.href} href={it.href} onClick={() => setOpen(false)}
                className={`py-2 ${pathname === it.href ? 'text-primary' : 'text-text'}`}>
                {it.label}
              </Link>
            ))}
            <Link href={pathname as any} locale={otherLocale} onClick={() => setOpen(false)}
              className="py-2 text-textMuted">
              {otherLocale.toUpperCase()}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
