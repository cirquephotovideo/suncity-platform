export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import Sidebar from '@/components/admin/Sidebar';
import { prisma } from '@/lib/prisma';
import { getSkin } from '@/lib/skins';
import type { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  const skin = getSkin(settings?.themeKey);
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col" style={{ ['--skin-accent' as any]: skin.accent }}>
      <div style={{ background: skin.accent, color: skin.bg, fontSize: 11, fontWeight: 600, letterSpacing: 1, textAlign: 'center', padding: '4px 8px' }}>
        {skin.emoji} SKIN ACTIF · {skin.label.toUpperCase()} · <a href="/admin/skins" style={{ color: skin.bg, textDecoration: 'underline' }}>changer</a>
      </div>
      <header className="border-b border-border bg-bgAlt/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-display text-lg">
            <span className="text-2xl">🌃</span>
            <span className="text-primary">Sun City</span>
            <span className="text-textMuted text-xs uppercase tracking-wider">BO</span>
          </Link>
          <div className="hidden md:flex items-center gap-3 max-w-md flex-1 mx-8">
            <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-textMuted w-full">
              <span className="opacity-60">🔍</span>
              <span className="opacity-60 flex-1">Rechercher : page, lieu, événement, paramètre…</span>
              <kbd className="text-[10px] bg-bgAlt border border-border rounded px-1">⌘K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session?.user && <span className="hidden md:inline text-sm text-textMuted">{session.user.email}</span>}
            <Link href="/api/auth/signout" className="text-sm text-textMuted hover:text-primary">Sortir</Link>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        {session?.user && <Sidebar />}
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
