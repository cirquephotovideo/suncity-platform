import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { setMediaStatus, deleteMedia, registerMediaByUrl as _registerMediaByUrl } from './actions';

async function registerMediaByUrl(formData: FormData) {
  'use server';
  await _registerMediaByUrl(formData);
}
import { publicUrl } from '@/lib/storage';

export default async function MediasIndex({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = (sp?.status?.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined) ?? 'PENDING';
  const medias = await prisma.mediaAsset.findMany({ where: { status: filter }, orderBy: { createdAt: 'desc' }, take: 100 });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Médias</h1>
        <div className="flex gap-2 text-sm">
          {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <Link key={s} href={`?status=${s.toLowerCase()}`} className={`px-3 py-1 rounded ${filter === s ? 'bg-primary text-bg' : 'bg-bgAlt text-textMuted hover:text-text'}`}>{s}</Link>
          ))}
        </div>
      </div>

      <details className="bg-bgAlt border border-border rounded-lg p-4 mb-6 text-sm">
        <summary className="cursor-pointer text-textMuted">Enregistrer un média existant (URL/clé S3)</summary>
        <form action={registerMediaByUrl} className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
          <input name="key" placeholder="key dans le bucket (ex: events/2026-05/affiche.jpg)" required className="bg-bg border border-border rounded px-3 py-2 md:col-span-2" />
          <input name="mime" placeholder="image/jpeg" defaultValue="image/jpeg" className="bg-bg border border-border rounded px-3 py-2" />
          <input name="sizeBytes" type="number" placeholder="bytes" className="bg-bg border border-border rounded px-3 py-2" />
          <input name="alt" placeholder="Alt text (a11y)" className="bg-bg border border-border rounded px-3 py-2 md:col-span-3" />
          <button className="btn-primary text-sm">Enregistrer</button>
        </form>
      </details>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {medias.map((m) => (
          <div key={m.id} className="bg-bgAlt border border-border rounded-lg overflow-hidden">
            <div className="aspect-video bg-bg flex items-center justify-center text-textMuted text-xs">
              {m.mime.startsWith('image/') ? <img src={publicUrl(m.key)} alt={m.alt ?? ''} className="object-cover w-full h-full" /> : <span>{m.mime}</span>}
            </div>
            <div className="p-3 space-y-2">
              <p className="font-mono text-xs truncate" title={m.key}>{m.key}</p>
              <p className="text-xs text-textMuted">{(m.sizeBytes / 1024).toFixed(1)} KB</p>
              <div className="flex gap-1">
                {m.status !== 'APPROVED' && <form action={setMediaStatus.bind(null, m.id, 'APPROVED')} className="flex-1"><button className="w-full bg-success/20 text-success rounded px-2 py-1 text-xs hover:bg-success/30">Valider</button></form>}
                {m.status !== 'REJECTED' && <form action={setMediaStatus.bind(null, m.id, 'REJECTED')} className="flex-1"><button className="w-full bg-danger/20 text-danger rounded px-2 py-1 text-xs hover:bg-danger/30">Refuser</button></form>}
                <form action={deleteMedia.bind(null, m.id)}><button className="bg-bgAlt text-textMuted rounded px-2 py-1 text-xs hover:text-danger" title="Supprimer">×</button></form>
              </div>
            </div>
          </div>
        ))}
        {medias.length === 0 && <p className="text-textMuted col-span-full italic">Aucun média {filter.toLowerCase()}.</p>}
      </div>
    </div>
  );
}
