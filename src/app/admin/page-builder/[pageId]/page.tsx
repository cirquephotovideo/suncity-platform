import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { addBlock as _addBlock, updateBlock, deleteBlock } from '../actions';
import SubmitButton from '@/components/admin/SubmitButton';
import Link from 'next/link';
import type { BlockKind } from '@prisma/client';

async function addBlock(pageId: string, kind: any) {
  'use server';
  await _addBlock(pageId, kind);
}

const BLOCK_KINDS: { kind: BlockKind; label: string; icon: string }[] = [
  { kind: 'HERO_VIDEO',     label: 'Hero vidéo',          icon: 'ti-video' },
  { kind: 'HERO_IMAGE',     label: 'Hero image',          icon: 'ti-photo' },
  { kind: 'TEXT',           label: 'Texte HTML',          icon: 'ti-text-size' },
  { kind: 'IMAGE',          label: 'Image',               icon: 'ti-photo' },
  { kind: 'CTA',            label: 'Bouton CTA',          icon: 'ti-pointer' },
  { kind: 'GALLERY',        label: 'Galerie photos',      icon: 'ti-photo-stack' },
  { kind: 'EVENT_LIST',     label: 'Liste événements',    icon: 'ti-calendar' },
  { kind: 'LOCATION_LIST',  label: 'Liste lieux',         icon: 'ti-map-pin' },
  { kind: 'TARIFF_TABLE',   label: 'Tableau tarifs',      icon: 'ti-receipt' },
  { kind: 'PARTNERS',       label: 'Partenaires',         icon: 'ti-handshake' },
  { kind: 'CONTACT_FORM',   label: 'Formulaire contact',  icon: 'ti-mail' },
  { kind: 'NEWSLETTER_FORM',label: 'Newsletter',          icon: 'ti-mailbox' },
  { kind: 'RAW_HTML',       label: 'HTML brut',           icon: 'ti-code' },
  { kind: 'EMBED',          label: 'Embed iframe',        icon: 'ti-frame' },
];

export default async function PageBuilderEdit({ params }: { params: Promise<{ pageId: string }> }) {
  await requireAdmin();
  const { pageId } = await params;
  const page = await prisma.page.findUnique({ where: { id: pageId }, include: { blocks: { orderBy: { orderIdx: 'asc' } } } });
  if (!page) notFound();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div>
        <Link href="/admin/page-builder" className="text-sm text-textMuted hover:text-primary">← Toutes les pages</Link>
        <h1 className="font-display text-3xl mt-3 mb-1">{page.title}</h1>
        <p className="font-mono text-xs text-textMuted mb-6">/{page.locale}/{page.slug}</p>

        <div className="space-y-4">
          {page.blocks.map(b => (
            <div key={b.id} className="bg-bgAlt border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs uppercase tracking-wider text-primary">{b.kind}</span>
                  <span className="text-xs text-textMuted ml-3">order {b.orderIdx}</span>
                  {!b.visible && <span className="text-xs text-warning ml-3">⚠ caché</span>}
                </div>
                <form action={deleteBlock.bind(null, b.id, pageId)} className="inline"><button className="text-xs text-danger hover:underline">Supprimer</button></form>
              </div>
              <form action={updateBlock.bind(null, b.id)} className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" name="visible" defaultChecked={b.visible} /> Visible</label>
                  <label className="flex items-center gap-2"><span className="text-textMuted">Order</span><input type="number" name="orderIdx" defaultValue={b.orderIdx} className="w-20 bg-bg border border-border rounded px-2 py-1" /></label>
                </div>
                <textarea name="dataJson" rows={6} defaultValue={JSON.stringify(b.dataJson, null, 2)} className="w-full bg-bg border border-border rounded px-3 py-2 font-mono text-xs" />
                <SubmitButton className="btn-outline text-xs">Enregistrer</SubmitButton>
              </form>
            </div>
          ))}
          {page.blocks.length === 0 && <p className="text-textMuted italic">Aucun bloc encore. Ajoute-en un depuis la sidebar →</p>}
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 self-start bg-bgAlt border border-border rounded-lg p-4">
        <p className="text-xs uppercase tracking-wider text-textMuted mb-3">Ajouter un bloc</p>
        <div className="grid grid-cols-2 gap-2">
          {BLOCK_KINDS.map(k => (
            <form key={k.kind} action={addBlock.bind(null, pageId, k.kind)} className="contents">
              <button className="bg-bg border border-border rounded px-2 py-2 text-xs text-left hover:border-primary/60 hover:text-primary transition">
                <span className={`ti ${k.icon}`} aria-hidden /> {k.label}
              </button>
            </form>
          ))}
        </div>
      </aside>
    </div>
  );
}
