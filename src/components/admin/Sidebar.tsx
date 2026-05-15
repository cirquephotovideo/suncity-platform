'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/admin', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { group: 'Contenu' },
  { href: '/admin/pages', label: 'Pages', icon: 'ti-file-text' },
  { href: '/admin/agenda', label: 'Agenda', icon: 'ti-calendar' },
  { href: '/admin/lieux', label: 'Lieux', icon: 'ti-map-pin' },
  { href: '/admin/tarifs', label: 'Tarifs', icon: 'ti-receipt' },
  { href: '/admin/medias', label: 'Médias', icon: 'ti-photo' },
  { href: '/admin/banners', label: 'Bandeaux', icon: 'ti-flag' },
  { href: '/admin/page-builder', label: 'Page Builder', icon: 'ti-layout-grid' },
  { group: 'Billetterie' },
  { href: '/admin/products', label: 'Produits', icon: 'ti-tag' },
  { href: '/admin/orders', label: 'Commandes', icon: 'ti-shopping-cart' },
  { href: '/admin/coupons', label: 'Coupons', icon: 'ti-discount' },
  { group: 'Communication' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: 'ti-mail' },
  { href: '/admin/contact', label: 'Contact', icon: 'ti-message' },
  { group: 'Configuration' },
  { href: '/admin/partners', label: 'Partenaires', icon: 'ti-handshake' },
  { href: '/admin/themes', label: 'Thèmes', icon: 'ti-palette' },
  { href: '/admin/settings', label: 'Paramètres', icon: 'ti-settings' },
  { href: '/admin/audit', label: 'Audit log', icon: 'ti-history' },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block w-60 bg-bgAlt border-r border-border min-h-screen flex-shrink-0">
      <nav className="p-3 space-y-0.5">
        {items.map((it, i) => {
          if ('group' in it) {
            return <p key={i} className="text-xs uppercase tracking-wider text-textMuted mt-4 mb-2 px-3">{it.group}</p>;
          }
          const active = pathname === it.href || (it.href !== '/admin' && pathname.startsWith(it.href));
          return (
            <Link key={it.href} href={it.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition ${active ? 'bg-primary/10 text-primary' : 'text-text hover:bg-bg'}`}>
              <span className={`ti ${it.icon}`} aria-hidden />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
