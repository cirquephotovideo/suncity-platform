import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export default async function ContactInbox({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = sp?.status?.toUpperCase() as 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED' | undefined;
  const where = filter ? { status: filter } : {};
  const messages = await prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Boîte contact</h1>
        <div className="flex gap-2 text-sm">
          <Link href="/admin/contact" className={`px-3 py-1 rounded ${!filter ? 'bg-primary text-bg' : 'bg-bgAlt text-textMuted hover:text-text'}`}>Tous</Link>
          {['UNREAD', 'READ', 'REPLIED', 'ARCHIVED'].map((s) => (
            <Link key={s} href={`?status=${s.toLowerCase()}`} className={`px-3 py-1 rounded ${filter === s ? 'bg-primary text-bg' : 'bg-bgAlt text-textMuted hover:text-text'}`}>{s}</Link>
          ))}
        </div>
      </div>
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-textMuted text-left"><tr><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">De</th><th className="px-4 py-2.5">Sujet</th><th className="px-4 py-2.5">Statut</th></tr></thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="border-t border-border hover:bg-bg/50">
                <td className="px-4 py-2.5 text-xs">{m.createdAt.toLocaleString('fr-FR')}</td>
                <td className="px-4 py-2.5"><Link href={`/admin/contact/${m.id}`} className="text-primary hover:underline">{m.name} &lt;{m.email}&gt;</Link></td>
                <td className="px-4 py-2.5 truncate max-w-xs">{m.subject ?? <em className="text-textMuted">Sans objet</em>}</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${m.status === 'UNREAD' ? 'bg-primary/20 text-primary' : 'bg-textMuted/20 text-textMuted'}`}>{m.status}</span></td>
              </tr>
            ))}
            {messages.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-textMuted italic">Aucun message.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
