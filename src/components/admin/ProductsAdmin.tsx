'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Save, X, Loader2, UploadCloud, Image as ImageIcon, Plus, Trash2,
  Package, Tag as TagIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type VariantRow = {
  id?: string | null;
  sku: string;
  label: string;
  priceCents: number;
  currency: string;
  stripePriceId?: string | null;
  active: boolean;
  stockQty?: number | null;
  orderIndex: number;
};

export type ProductRich = {
  id?: string;
  slug?: string;
  kind?: 'TICKET_DAY' | 'TICKET_EVENING' | 'PASS_MULTI' | 'SUBSCRIPTION' | 'GIFT_CARD';
  active?: boolean;
  stripeProductId?: string | null;
  coverImageUrl?: string | null;
  galleryUrls?: string[];
  category?: string | null;
  tags?: string[];
  redeemableFrom?: string | null;
  redeemableTo?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  // FR
  title_fr?: string;
  description_fr?: string;
  // EN
  title_en?: string;
  description_en?: string;
  variants?: VariantRow[];
};

const PRODUCT_KINDS: Array<{ value: ProductRich['kind']; label: string }> = [
  { value: 'TICKET_DAY', label: 'Billet jour' },
  { value: 'TICKET_EVENING', label: 'Billet soirée' },
  { value: 'PASS_MULTI', label: 'Pass / Carnet' },
  { value: 'SUBSCRIPTION', label: 'Abonnement' },
  { value: 'GIFT_CARD', label: 'Carte cadeau' },
];

const CATEGORIES = [
  { slug: 'standard', label: 'Standard' },
  { slug: 'reduit', label: 'Tarif réduit' },
  { slug: 'abonnement', label: 'Abonnement' },
  { slug: 'carnet', label: 'Carnet / Pass' },
];

interface ProductsAdminProps {
  product?: ProductRich | null;
  onClose: () => void;
  onSaved: (p: ProductRich) => void;
}

export function ProductsAdmin({ product, onClose, onSaved }: ProductsAdminProps) {
  // Base
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [kind, setKind] = useState<ProductRich['kind']>(product?.kind ?? 'TICKET_DAY');
  const [active, setActive] = useState(product?.active ?? true);
  const [stripeProductId, setStripeProductId] = useState(product?.stripeProductId ?? '');
  const [category, setCategory] = useState(product?.category ?? 'standard');
  const [tagsInput, setTagsInput] = useState((product?.tags ?? []).join(', '));

  // Translations
  const [titleFr, setTitleFr] = useState(product?.title_fr ?? '');
  const [descFr, setDescFr] = useState(product?.description_fr ?? '');
  const [titleEn, setTitleEn] = useState(product?.title_en ?? '');
  const [descEn, setDescEn] = useState(product?.description_en ?? '');

  // Cover + gallery
  const [coverImageUrl, setCoverImageUrl] = useState(product?.coverImageUrl ?? '');
  const [gallery, setGallery] = useState<string[]>(product?.galleryUrls ?? []);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);

  // Availability
  const [redeemableFrom, setRedeemableFrom] = useState(
    product?.redeemableFrom ? new Date(product.redeemableFrom).toISOString().slice(0, 16) : ''
  );
  const [redeemableTo, setRedeemableTo] = useState(
    product?.redeemableTo ? new Date(product.redeemableTo).toISOString().slice(0, 16) : ''
  );

  // SEO
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription ?? '');

  // Variants
  const [variants, setVariants] = useState<VariantRow[]>(
    (product?.variants ?? []).length
      ? product!.variants!
      : [{ sku: '', label: 'Standard', priceCents: 0, currency: 'EUR', active: true, orderIndex: 0 }]
  );

  function setVariant(idx: number, patch: Partial<VariantRow>) {
    setVariants(vs => vs.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }
  function addVariant() {
    setVariants(vs => [
      ...vs,
      { sku: '', label: '', priceCents: 0, currency: 'EUR', active: true, orderIndex: vs.length },
    ]);
  }
  function removeVariant(idx: number) {
    setVariants(vs => vs.filter((_, i) => i !== idx).map((v, i) => ({ ...v, orderIndex: i })));
  }

  // Save state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Upload helpers ──────────────────────────────────────────────────────────
  async function uploadCover(file: File) {
    setCoverBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/products/upload', { method: 'POST', body: fd });
      const j = await r.json();
      if (j.ok && j.url) setCoverImageUrl(j.url);
      else alert('Upload erreur : ' + (j.error ?? 'inconnue'));
    } finally {
      setCoverBusy(false);
    }
  }
  async function uploadGallery(files: FileList) {
    setGalleryBusy(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const r = await fetch('/api/products/upload', { method: 'POST', body: fd });
        const j = await r.json();
        if (j.ok && j.url) urls.push(j.url);
      }
      setGallery(g => [...g, ...urls]);
    } finally {
      setGalleryBusy(false);
    }
  }
  function removeGalleryItem(url: string) {
    setGallery(g => g.filter(u => u !== url));
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function save() {
    if (!titleFr) { setError('Titre FR requis'); return; }
    setBusy(true);
    setError(null);
    const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);

    const payload: any = {
      slug: slug || undefined,
      kind,
      active,
      stripeProductId: stripeProductId || null,
      coverImageUrl: coverImageUrl || null,
      galleryUrls: gallery,
      category,
      tags,
      redeemableFrom: redeemableFrom || null,
      redeemableTo: redeemableTo || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      title_fr: titleFr,
      description_fr: descFr || null,
      title_en: titleEn || '',
      description_en: descEn || null,
      variants: variants
        .filter(v => v.sku.trim() && v.label.trim())
        .map((v, i) => ({
          ...v,
          priceCents: Number(v.priceCents) || 0,
          stockQty: v.stockQty == null || (v.stockQty as any) === '' ? null : Number(v.stockQty),
          orderIndex: i,
        })),
    };

    try {
      const url = product?.id ? `/api/products/${product.id}` : '/api/products';
      const method = product?.id ? 'PATCH' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (j.ok && j.product) onSaved(j.product);
      else setError(j.error ?? 'Erreur lors de la sauvegarde');
    } catch (e: any) {
      setError(e?.message ?? 'Erreur réseau');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bgAlt border border-border rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border flex items-center justify-between px-5 py-3.5">
          <h2 className="font-display text-lg flex items-center gap-2">
            <Package size={18} />
            {product?.id ? 'Éditer le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onClose} className="text-textMuted hover:text-text">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Meta row */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-5">
              <label className="text-xs text-textMuted block mb-1">Slug</label>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="auto-généré depuis le titre FR"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>
            <div className="col-span-3">
              <label className="text-xs text-textMuted block mb-1">Type</label>
              <select
                value={kind}
                onChange={e => setKind(e.target.value as any)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              >
                {PRODUCT_KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </div>
            <div className="col-span-3">
              <label className="text-xs text-textMuted block mb-1">Catégorie</label>
              <select
                value={category ?? ''}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              >
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </div>
            <label className="col-span-1 flex items-center gap-1 text-sm self-end pb-2">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-xs">Actif</span>
            </label>
          </div>

          {/* Translations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-textMuted">FR</p>
              <input
                value={titleFr}
                onChange={e => setTitleFr(e.target.value)}
                placeholder="Nom (FR) — requis"
                required
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-bold"
              />
              <textarea
                value={descFr}
                onChange={e => setDescFr(e.target.value)}
                rows={4}
                placeholder="Description (FR)"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-textMuted">EN</p>
              <input
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                placeholder="Name (EN)"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-bold"
              />
              <textarea
                value={descEn}
                onChange={e => setDescEn(e.target.value)}
                rows={4}
                placeholder="Description (EN)"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Stripe + tags */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-textMuted block mb-1">Stripe Product ID</label>
              <input
                value={stripeProductId}
                onChange={e => setStripeProductId(e.target.value)}
                placeholder="prod_…"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-textMuted block mb-1 flex items-center gap-1">
                <TagIcon size={11} /> Tags (virgules)
              </label>
              <input
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="ex: pride, été, soirée"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Cover */}
          <div className="bg-bg border border-border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-textMuted">Couverture</p>
              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                disabled={coverBusy}
                className="btn-ghost text-xs flex items-center gap-1"
              >
                {coverBusy ? <Loader2 size={11} className="animate-spin" /> : <UploadCloud size={11} />}
                Téléverser
              </button>
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                hidden
                onChange={e => e.target.files?.[0] && uploadCover(e.target.files[0])}
              />
            </div>
            {coverImageUrl ? (
              <div className="rounded-lg overflow-hidden bg-bg max-h-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImageUrl} alt="" className="w-full max-h-44 object-cover" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-textMuted border border-dashed border-border rounded-lg text-xs">
                <ImageIcon size={14} className="mr-1.5" /> Aucune image
              </div>
            )}
            <input
              value={coverImageUrl}
              onChange={e => setCoverImageUrl(e.target.value)}
              placeholder="URL de couverture"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono"
            />
          </div>

          {/* Gallery */}
          <div className="bg-bg border border-border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-textMuted">Galerie ({gallery.length})</p>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                disabled={galleryBusy}
                className="btn-ghost text-xs flex items-center gap-1"
              >
                {galleryBusy ? <Loader2 size={11} className="animate-spin" /> : <UploadCloud size={11} />}
                Ajouter image(s)
              </button>
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={e => e.target.files && uploadGallery(e.target.files)}
              />
            </div>
            {gallery.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {gallery.map(url => (
                  <div key={url} className="relative rounded-lg overflow-hidden border border-border group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full aspect-square object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(url)}
                      className="absolute top-1 right-1 bg-bgAlt/90 text-danger p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-textMuted">Aucune image dans la galerie.</p>
            )}
          </div>

          {/* Variants */}
          <div className="bg-bg border border-border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-textMuted">
                Variants ({variants.length})
              </p>
              <button
                type="button"
                onClick={addVariant}
                className="btn-ghost text-xs flex items-center gap-1"
              >
                <Plus size={11} /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-1.5 items-center bg-bgAlt border border-border rounded-lg p-2"
                >
                  <input
                    value={v.sku}
                    onChange={e => setVariant(idx, { sku: e.target.value })}
                    placeholder="SKU"
                    className="col-span-2 bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono"
                  />
                  <input
                    value={v.label}
                    onChange={e => setVariant(idx, { label: e.target.value })}
                    placeholder="Label"
                    className="col-span-3 bg-bg border border-border rounded px-2 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    value={v.priceCents}
                    onChange={e => setVariant(idx, { priceCents: Number(e.target.value) })}
                    placeholder="centimes"
                    className="col-span-2 bg-bg border border-border rounded px-2 py-1.5 text-xs"
                    title="Prix en centimes"
                  />
                  <input
                    type="number"
                    value={v.stockQty ?? ''}
                    onChange={e => setVariant(idx, { stockQty: e.target.value === '' ? null : Number(e.target.value) })}
                    placeholder="stock"
                    className="col-span-1 bg-bg border border-border rounded px-2 py-1.5 text-xs"
                    title="Stock (vide = illimité)"
                  />
                  <input
                    value={v.stripePriceId ?? ''}
                    onChange={e => setVariant(idx, { stripePriceId: e.target.value })}
                    placeholder="price_…"
                    className="col-span-3 bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono"
                    title="Stripe price ID"
                  />
                  <label className="col-span-1 flex items-center justify-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={v.active}
                      onChange={e => setVariant(idx, { active: e.target.checked })}
                      className="accent-primary"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="text-danger hover:opacity-80"
                    title="Supprimer le variant"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-textMuted">
              Prix en centimes (ex : 1500 = 15 €). Stock vide = illimité.
            </p>
          </div>

          {/* Availability */}
          <div className="border border-secondary/30 bg-secondary/5 rounded-xl p-3 space-y-2">
            <div className="text-xs uppercase font-bold text-secondary">Disponibilité</div>
            <p className="text-[10px] text-textMuted">
              Vide : produit toujours dispo. Sinon affiché uniquement entre ces dates (utile pour promos).
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[9px] uppercase text-textMuted block mb-0.5">Disponible du</span>
                <input
                  type="datetime-local"
                  value={redeemableFrom}
                  onChange={e => setRedeemableFrom(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-2 py-1.5 text-xs"
                />
              </label>
              <label className="block">
                <span className="text-[9px] uppercase text-textMuted block mb-0.5">Jusqu'au</span>
                <input
                  type="datetime-local"
                  value={redeemableTo}
                  onChange={e => setRedeemableTo(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-2 py-1.5 text-xs"
                />
              </label>
            </div>
          </div>

          {/* SEO */}
          <details className="border border-border rounded-xl p-3 bg-bg">
            <summary className="cursor-pointer text-xs uppercase tracking-widest text-textMuted">SEO</summary>
            <div className="mt-3 space-y-2">
              <input
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
                placeholder="Meta title (≤ 60 car.)"
                className="w-full bg-bgAlt border border-border rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                value={metaDescription}
                onChange={e => setMetaDescription(e.target.value)}
                rows={2}
                placeholder="Meta description (≤ 160 car.)"
                className="w-full bg-bgAlt border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </details>

          {error && (
            <div className="text-xs bg-danger/10 text-danger border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3.5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost text-sm">Annuler</button>
          <button
            onClick={save}
            disabled={busy || !titleFr}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            {busy ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {product?.id ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}
