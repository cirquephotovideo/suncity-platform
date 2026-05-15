'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Save, X, Loader2, UploadCloud, Image as ImageIcon, Pin, Tag as TagIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type NewsRich = {
  id?: string;
  slug?: string;
  category?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  pinned?: boolean;
  coverImageUrl?: string | null;
  ogImageUrl?: string | null;
  tags?: string[];
  publishedAt?: string | null;
  scheduledAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  authorId?: string | null;
  // FR
  title_fr?: string;
  excerpt_fr?: string;
  contentHtml_fr?: string;
  // EN
  title_en?: string;
  excerpt_en?: string;
  contentHtml_en?: string;
};

const CATEGORIES = [
  { slug: 'evenements', label: 'Événements' },
  { slug: 'programmation', label: 'Programmation' },
  { slug: 'prevention', label: 'Prévention' },
  { slug: 'lifestyle', label: 'Lifestyle' },
  { slug: 'presse', label: 'Presse' },
];

interface NewsManagerProps {
  news?: NewsRich | null;
  onClose: () => void;
  onSaved: (n: NewsRich) => void;
}

export function NewsManager({ news, onClose, onSaved }: NewsManagerProps) {
  // Status / publish
  type Status = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  const initialStatus: Status =
    news?.scheduledAt && news?.status === 'DRAFT'
      ? 'SCHEDULED'
      : (news?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');

  const [status, setStatus] = useState<Status>(initialStatus);
  const [publishedAt, setPublishedAt] = useState(
    news?.publishedAt ? new Date(news.publishedAt).toISOString().slice(0, 16) : ''
  );
  const [scheduledAt, setScheduledAt] = useState(
    news?.scheduledAt ? new Date(news.scheduledAt).toISOString().slice(0, 16) : ''
  );

  // Slug + category + pinned
  const [slug, setSlug] = useState(news?.slug ?? '');
  const [category, setCategory] = useState(news?.category ?? 'evenements');
  const [pinned, setPinned] = useState(!!news?.pinned);

  // FR / EN content
  const [titleFr, setTitleFr] = useState(news?.title_fr ?? '');
  const [excerptFr, setExcerptFr] = useState(news?.excerpt_fr ?? '');
  const [bodyFr, setBodyFr] = useState(news?.contentHtml_fr ?? '');
  const [titleEn, setTitleEn] = useState(news?.title_en ?? '');
  const [excerptEn, setExcerptEn] = useState(news?.excerpt_en ?? '');
  const [bodyEn, setBodyEn] = useState(news?.contentHtml_en ?? '');

  // Cover + OG
  const [coverImageUrl, setCoverImageUrl] = useState(news?.coverImageUrl ?? '');
  const [ogImageUrl, setOgImageUrl] = useState(news?.ogImageUrl ?? '');
  const coverRef = useRef<HTMLInputElement>(null);
  const ogRef = useRef<HTMLInputElement>(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [ogBusy, setOgBusy] = useState(false);

  // Tags
  const [tagsInput, setTagsInput] = useState((news?.tags ?? []).join(', '));

  // SEO
  const [metaTitle, setMetaTitle] = useState(news?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(news?.metaDescription ?? '');

  // Authors
  type Author = { id: string; name: string | null; email: string; role: string };
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorId, setAuthorId] = useState(news?.authorId ?? '');

  useEffect(() => {
    fetch('/api/admin/authors')
      .then(r => r.json())
      .then(j => { if (j.ok) setAuthors(j.authors); })
      .catch(() => {});
  }, []);

  // Save state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Upload helpers ──────────────────────────────────────────────────────────
  async function uploadFile(file: File, target: 'cover' | 'og') {
    const setter = target === 'cover' ? setCoverImageUrl : setOgImageUrl;
    const setBusyFn = target === 'cover' ? setCoverBusy : setOgBusy;
    setBusyFn(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/news/upload', { method: 'POST', body: fd });
      const j = await r.json();
      if (j.ok && j.url) setter(j.url);
      else alert('Upload erreur : ' + (j.error ?? 'inconnue'));
    } finally {
      setBusyFn(false);
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function save() {
    if (!titleFr) { setError('Titre FR requis'); return; }
    setBusy(true);
    setError(null);

    const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);

    // Compute persisted status + dates from UI state.
    let persistedStatus: 'DRAFT' | 'PUBLISHED' = 'DRAFT';
    let pubAt: string | null = null;
    let schedAt: string | null = null;

    if (status === 'PUBLISHED') {
      persistedStatus = 'PUBLISHED';
      pubAt = publishedAt || new Date().toISOString();
    } else if (status === 'SCHEDULED') {
      persistedStatus = 'DRAFT';
      schedAt = scheduledAt || null;
    } else {
      persistedStatus = 'DRAFT';
    }

    const payload: any = {
      slug: slug || undefined,
      category,
      status: persistedStatus,
      pinned,
      coverImageUrl: coverImageUrl || null,
      ogImageUrl: ogImageUrl || coverImageUrl || null,
      tags,
      publishedAt: pubAt,
      scheduledAt: schedAt,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      authorId: authorId || null,
      title_fr: titleFr,
      excerpt_fr: excerptFr || null,
      contentHtml_fr: bodyFr || null,
      title_en: titleEn || '',
      excerpt_en: excerptEn || null,
      contentHtml_en: bodyEn || null,
    };

    try {
      const url = news?.id ? `/api/news/${news.id}` : '/api/news';
      const method = news?.id ? 'PATCH' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (j.ok && j.news) onSaved(j.news);
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
          <h2 className="font-display text-lg">
            {news?.id ? 'Éditer l\'actualité' : 'Nouvelle actualité'}
          </h2>
          <button onClick={onClose} className="text-textMuted hover:text-text">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Meta row */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <label className="text-xs text-textMuted block mb-1">Slug</label>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="auto-généré depuis le titre FR"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>
            <div className="col-span-4">
              <label className="text-xs text-textMuted block mb-1">Catégorie</label>
              <select
                value={category ?? ''}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              >
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </div>
            <label className="col-span-2 flex items-center gap-2 text-sm self-end pb-2">
              <input
                type="checkbox"
                checked={pinned}
                onChange={e => setPinned(e.target.checked)}
                className="accent-primary"
              />
              <Pin size={12} />
              <span>Épinglé</span>
            </label>
          </div>

          {/* Translations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-textMuted">FR</p>
              <input
                value={titleFr}
                onChange={e => setTitleFr(e.target.value)}
                placeholder="Titre (FR) — requis"
                required
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-bold"
              />
              <textarea
                value={excerptFr}
                onChange={e => setExcerptFr(e.target.value)}
                rows={2}
                placeholder="Chapô / résumé (FR)"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                value={bodyFr}
                onChange={e => setBodyFr(e.target.value)}
                rows={8}
                placeholder="Corps de l'article (HTML autorisé) — FR"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-mono leading-relaxed"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-textMuted">EN</p>
              <input
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                placeholder="Title (EN) — optional"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-bold"
              />
              <textarea
                value={excerptEn}
                onChange={e => setExcerptEn(e.target.value)}
                rows={2}
                placeholder="Excerpt (EN)"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                value={bodyEn}
                onChange={e => setBodyEn(e.target.value)}
                rows={8}
                placeholder="Body (HTML allowed) — EN"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-bg border border-border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-textMuted">Image de couverture</p>
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
                onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'cover')}
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
              placeholder="https://… (ou utilise Téléverser)"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-textMuted block mb-1 flex items-center gap-1">
              <TagIcon size={11} /> Tags (séparés par virgule)
            </label>
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="ex: pride, soirée, dj-set"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Author */}
          <div>
            <label className="text-xs text-textMuted block mb-1">Auteur</label>
            <select
              value={authorId ?? ''}
              onChange={e => setAuthorId(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">— Aucun —</option>
              {authors.map(u => (
                <option key={u.id} value={u.id}>
                  {(u.name ?? u.email)} · {u.role}
                </option>
              ))}
            </select>
          </div>

          {/* Status & publish */}
          <div className="border border-secondary/30 bg-secondary/5 rounded-xl p-3 space-y-2">
            <div className="text-xs uppercase font-bold text-secondary">Publication</div>
            <div className="grid grid-cols-3 gap-2">
              {(['DRAFT', 'SCHEDULED', 'PUBLISHED'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`text-xs py-2 rounded-lg border ${
                    status === s
                      ? 'bg-primary text-bg font-bold border-primary'
                      : 'bg-bg border-border text-textMuted hover:text-text'
                  }`}
                >
                  {s === 'DRAFT' ? 'Brouillon' : s === 'SCHEDULED' ? 'Programmé' : 'Publié'}
                </button>
              ))}
            </div>
            {status === 'PUBLISHED' && (
              <label className="block">
                <span className="text-[9px] uppercase text-textMuted block mb-0.5">Publié le</span>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={e => setPublishedAt(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-2 py-1.5 text-xs"
                />
              </label>
            )}
            {status === 'SCHEDULED' && (
              <label className="block">
                <span className="text-[9px] uppercase text-textMuted block mb-0.5">Sera publié le</span>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-2 py-1.5 text-xs"
                />
              </label>
            )}
          </div>

          {/* SEO */}
          <details className="border border-border rounded-xl p-3 bg-bg">
            <summary className="cursor-pointer text-xs uppercase tracking-widest text-textMuted">SEO + Open Graph</summary>
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
              <div className="flex items-center justify-between">
                <p className="text-xs text-textMuted">Image OG (par défaut : couverture)</p>
                <button
                  type="button"
                  onClick={() => ogRef.current?.click()}
                  disabled={ogBusy}
                  className="btn-ghost text-xs flex items-center gap-1"
                >
                  {ogBusy ? <Loader2 size={11} className="animate-spin" /> : <UploadCloud size={11} />}
                  Téléverser
                </button>
                <input
                  ref={ogRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'og')}
                />
              </div>
              {ogImageUrl && (
                <div className="rounded-lg overflow-hidden bg-bg max-h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ogImageUrl} alt="" className="w-full max-h-32 object-cover" />
                </div>
              )}
              <input
                value={ogImageUrl}
                onChange={e => setOgImageUrl(e.target.value)}
                placeholder="https://… image og"
                className="w-full bg-bgAlt border border-border rounded-lg px-3 py-2 text-xs font-mono"
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
            {news?.id ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}
