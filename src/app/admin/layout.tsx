export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  // /admin/login est servi indépendamment ; si on n'est pas connecté pour les autres routes, on redirige
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-bgAlt">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-display text-xl text-primary">Sun City — BO</Link>
          {session?.user && <span className="text-sm text-textMuted">{session.user.email}</span>}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
