export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import Sidebar from '@/components/admin/Sidebar';
import type { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <header className="border-b border-border bg-bgAlt">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="font-display text-lg text-primary">Sun City — BO</Link>
          <div className="flex items-center gap-4">
            {session?.user && <span className="text-sm text-textMuted">{session.user.email}</span>}
            <Link href="/api/auth/signout" className="text-sm text-textMuted hover:text-primary">Sortir</Link>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        {session?.user && <Sidebar />}
        <main className="flex-1 p-6 md:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
