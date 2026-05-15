import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { setContactStatus, deleteContact } from '../actions';

export default async function ContactDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const m = await prisma.contactMessage.findUnique({ where: { id } });
  if (!m) notFound();
  if (m.status === 'UNREAD') await setContactStatus(id, 'READ');

  return (
    <div className="max-w-2xl">
      <Link href="/admin/contact" className="text-sm text-textMuted hover:text-primary">← Retour</Link>
      <h1 className="font-display text-2xl mt-3 mb-1">{m.subject ?? 'Sans objet'}</h1>
      <p className="text-textMuted text-sm mb-4">{m.name} &lt;<a className="text-primary" href={`mailto:${m.email}`}>{m.email}</a>&gt; · {m.createdAt.toLocaleString('fr-FR')}</p>
      <div className="bg-bgAlt border border-border rounded-lg p-5 whitespace-pre-line">{m.body}</div>
      <p className="text-xs text-textMuted mt-3">IP : {m.ip ?? '?'} · UA : {m.userAgent ?? '?'}</p>
      <div className="flex gap-2 mt-6">
        <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject ?? '')}`} className="btn-primary text-sm">Répondre</a>
        <form action={setContactStatus.bind(null, id, 'REPLIED')}><button className="btn-outline text-sm">Marquer répondu</button></form>
        <form action={setContactStatus.bind(null, id, 'ARCHIVED')}><button className="btn-ghost text-sm">Archiver</button></form>
        <form action={deleteContact.bind(null, id)}><button className="btn-ghost text-sm text-danger">Supprimer</button></form>
      </div>
    </div>
  );
}
