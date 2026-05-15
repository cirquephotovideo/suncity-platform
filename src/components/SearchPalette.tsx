'use client';
import { useEffect, useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

const ALL_ITEMS = [
  { label: 'Accueil', href: '/', kw: 'home accueil welcome bienvenue' },
  { label: 'Agenda', href: '/agenda', kw: 'agenda soirée events nights' },
  { label: 'Lieux', href: '/lieux', kw: 'lieux places sauna hammam piscine jacuzzi sport drague' },
  { label: 'Tarifs', href: '/tarifs', kw: 'tarifs prix prices cost' },
  { label: 'Horaires & accès', href: '/horaires-acces', kw: 'horaires hours access metro' },
  { label: 'Règlement', href: '/reglement', kw: 'règlement rules' },
  { label: 'Check-in', href: '/checkin', kw: 'checkin entrée arrival' },
  { label: 'Contact', href: '/contact', kw: 'contact email phone' },
  { label: 'Newsletter', href: '/newsletter', kw: 'newsletter abonner subscribe' },
  { label: 'Galerie', href: '/galerie', kw: 'galerie gallery photos' },
  { label: 'Mentions légales', href: '/mentions-legales', kw: 'mentions légales legal' },
  { label: 'RGPD', href: '/rgpd', kw: 'rgpd privacy gdpr cookies' },
];

export default function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ALL_ITEMS.slice(0, 8);
    return ALL_ITEMS.filter(i => i.label.toLowerCase().includes(q) || i.kw.includes(q));
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery('');
    router.push(href as any);
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
              className="hidden md:flex items-center gap-2 text-xs text-textMuted bg-bgAlt border border-border rounded px-3 py-1.5 hover:border-primary/60 transition">
        <Search className="w-3.5 h-3.5" />
        <span>Rechercher</span>
        <kbd className="text-[10px] bg-bg border border-border rounded px-1 ml-2">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-start justify-center pt-[10vh]" onClick={() => setOpen(false)}>
          <div className="bg-bgAlt border border-border rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-textMuted flex-shrink-0" />
              <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
                     placeholder="Rechercher : page, lieu, événement, paramètre…"
                     className="flex-1 bg-transparent text-sm outline-none" />
              <kbd className="text-[10px] text-textMuted bg-bg border border-border rounded px-1.5 py-0.5">ESC</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto py-1">
              {filtered.map(i => (
                <li key={i.href}>
                  <button onClick={() => go(i.href)} className="w-full text-left px-4 py-2 text-sm hover:bg-bg flex items-center justify-between">
                    <span>{i.label}</span>
                    <span className="text-xs text-textMuted font-mono">{i.href}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-4 py-6 text-sm text-textMuted text-center">Aucun résultat</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
