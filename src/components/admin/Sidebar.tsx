'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Item = { href: string; label: string; emoji?: string; soon?: boolean; badge?: string };
type Group = { id: string; label: string; emoji: string; defaultOpen?: boolean; items: Item[] };

const GROUPS: Group[] = [
  {
    id: 'dashboard', label: 'Tableau de bord', emoji: '📊', defaultOpen: true,
    items: [
      { href: '/admin', label: 'Tableau de bord', emoji: '📊' },
    ],
  },
  {
    id: 'fav', label: '⭐ Nouveau', emoji: '⭐', defaultOpen: true,
    items: [
      { href: '/admin/sitemap', label: 'Site map (front + back)', emoji: '🗺️' },
      { href: '/admin/time-machine', label: 'Time Machine', emoji: '⏰' },
      { href: '/admin/invitations', label: 'Invitations admin', emoji: '🔑' },
      { href: '/admin/secrets', label: 'Secrets manager', emoji: '🔑' },
      { href: '/admin/tasks', label: 'Tasks board', emoji: '✅' },
      { href: '/admin/mail-setup', label: 'Templates emails', emoji: '✉️' },
      { href: '/admin/page-builder', label: 'Page Builder', emoji: '🎨' },
    ],
  },
  {
    id: 'ai', label: 'IA & Outils', emoji: '✨',
    items: [
      { href: '/admin/ai', label: 'Studio IA', emoji: '✨' },
      { href: '/admin/manuals', label: 'Manuels auto IA', emoji: '📚' },
      { href: '/admin/translations', label: 'Traductions IA (FR/EN)', emoji: '🌐' },
      { href: '/admin/telegram-bot', label: 'Bot Telegram', emoji: '✈️' },
      { href: '/admin/integrations', label: 'Intégrations', emoji: '🔌' },
      { href: '/admin/themes', label: 'Thèmes saisonniers', emoji: '🎨' },
      { href: '/admin/skins', label: 'Skins du site', emoji: '🌈' },
      { href: '/admin/feature-flags', label: 'Feature flags', emoji: '🚥' },
      { href: '/admin/setup', label: 'Assistant configuration', emoji: '✨' },
    ],
  },
  {
    id: 'system', label: 'Système', emoji: '⚙️',
    items: [
      { href: '/admin/menu', label: 'Menu nav', emoji: '☰' },
      { href: '/admin/settings', label: 'Page d\'accueil', emoji: '🏠' },
      { href: '/admin/menu-permissions', label: 'Visibilité menu (admin)', emoji: '👁️' },
      { href: '/admin/users', label: 'Utilisateurs', emoji: '👥' },
      { href: '/admin/backup', label: 'Sauvegardes (backup)', emoji: '💾' },
      { href: '/admin/settings', label: 'Paramètres', emoji: '⚙️' },
    ],
  },
  {
    id: 'content', label: 'Contenu', emoji: '📁',
    items: [
      { href: '/admin/import', label: 'Import en masse', emoji: '☁️' },
      { href: '/admin/map', label: 'Carte mondiale', emoji: '📍' },
      { href: '/admin/banners', label: 'Affiches', emoji: '🖼️' },
      { href: '/admin/news', label: 'Actualités', emoji: '📹' },
      { href: '/admin/agenda', label: 'Événements (agenda)', emoji: '📅' },
      { href: '/admin/lieux', label: 'Lieux LGBT-friendly', emoji: '🏳️‍🌈' },
      { href: '/admin/coupons', label: 'Coupons & promos', emoji: '🎟️' },
      { href: '/admin/youtube', label: 'Vidéos YouTube', emoji: '▶️' },
      { href: '/admin/banners', label: 'Bannières (hero)', emoji: '🎯' },
    ],
  },
  {
    id: 'comm', label: 'Communication', emoji: '✉️',
    items: [
      { href: '/admin/newsletter', label: 'Newsletter', emoji: '✉️' },
      { href: '/admin/newsletter/plan', label: 'Plan newsletter annuel', emoji: '📅' },
      { href: '/admin/calendar', label: 'Calendrier social', emoji: '📅' },
      { href: '/admin/pages', label: 'Pages riches', emoji: '📚' },
      { href: '/admin/pages', label: 'Pages & blog', emoji: '📄' },
      { href: '/admin/partners', label: 'Partenaires', emoji: '🤝' },
      { href: '/admin/gift-cards', label: 'Cartes cadeau', emoji: '🎁' },
    ],
  },
  {
    id: 'shop', label: 'Boutique', emoji: '🛍️',
    items: [
      { href: '/admin/products', label: 'Produits', emoji: '📦' },
      { href: '/admin/orders', label: 'Commandes', emoji: '🧾' },
    ],
  },
  {
    id: 'audit', label: 'Audit & Sécurité', emoji: '🛡️',
    items: [
      { href: '/admin/audit', label: 'Audit log', emoji: '🛡️' },
      { href: '/admin/security-settings', label: 'Sécurité (super-admin)', emoji: '🛡️' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(GROUPS.filter(g => g.defaultOpen).map(g => g.id))
  );

  function toggle(id: string) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <aside className="hidden md:block w-72 bg-bgAlt border-r border-border min-h-screen flex-shrink-0 overflow-y-auto">
      <nav className="p-3 space-y-1">
        {GROUPS.map(g => (
          <div key={g.id} className="mb-1">
            <button
              onClick={() => toggle(g.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs uppercase tracking-wider transition ${
                openGroups.has(g.id) ? 'text-primary bg-primary/10' : 'text-textMuted hover:text-text hover:bg-bg'
              }`}
            >
              <span className="flex items-center gap-2"><span>{g.emoji}</span>{g.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openGroups.has(g.id) ? 'rotate-180' : ''}`} />
            </button>
            {openGroups.has(g.id) && (
              <ul className="mt-1 space-y-0.5">
                {g.items.map((it, i) => {
                  const active = pathname === it.href || (it.href !== '/admin' && pathname.startsWith(it.href + '/'));
                  return (
                    <li key={`${g.id}-${i}`}>
                      {it.soon ? (
                        <span className="flex items-center justify-between px-3 py-1.5 rounded text-sm text-textMuted/60 cursor-not-allowed">
                          <span className="flex items-center gap-2.5">{it.emoji && <span className="opacity-60">{it.emoji}</span>}{it.label}</span>
                          <span className="text-[10px] uppercase tracking-wider opacity-60 bg-bg px-1.5 py-0.5 rounded">soon</span>
                        </span>
                      ) : (
                        <Link
                          href={it.href}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded text-sm transition ${
                            active
                              ? 'bg-primary text-bg font-medium shadow-[0_0_20px_rgba(201,162,75,0.3)]'
                              : 'text-text hover:bg-bg hover:text-primary'
                          }`}
                        >
                          {it.emoji && <span>{it.emoji}</span>}
                          <span>{it.label}</span>
                          {it.badge && <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">{it.badge}</span>}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
