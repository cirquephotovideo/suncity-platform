'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Save, X, Loader2, UploadCloud, Image as ImageIcon,
} from 'lucide-react';

// ─── Provider definitions ─────────────────────────────────────────────────────
type ImageProvider = 'gemini' | 'higgsfield' | 'picsum';
type VideoProvider = 'veo' | 'higgsfield' | 'sample';

const IMAGE_PROVIDERS: { slug: ImageProvider; label: string; short: string }[] = [
  { slug: 'gemini',     label: 'Gemini Nano Banana 2', short: 'Gemini' },
  { slug: 'higgsfield', label: 'Higgsfield',           short: 'Higgsfield' },
  { slug: 'picsum',     label: 'Picsum (stub)',        short: 'Picsum stub' },
];

const VIDEO_PROVIDERS: { slug: VideoProvider; label: string; short: string }[] = [
  { slug: 'veo',        label: 'Google Veo 3', short: 'Veo' },
  { slug: 'higgsfield', label: 'Higgsfield',   short: 'Higgsfield' },
  { slug: 'sample',     label: 'Sample MP4',   short: 'Sample MP4' },
];

type ProvidersAvailability = {
  image: { gemini: boolean; higgsfield: boolean; picsum: boolean };
  video: { veo: boolean; higgsfield: boolean; sample: boolean };
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type BannerRich = {
  id: string;
  slug: string;
  position: string;
  active: boolean;
  // Rich fields (may be absent on older records)
  eyebrow?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  accentColor?: string | null;
  themeSlug?: string | null;
  ctaUrl?: string | null;
  ctaLabel2?: string | null;
  ctaUrl2?: string | null;
  aiPrompt?: string | null;
  presetSlug?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  // FR translation (denormalised for editor convenience)
  title_fr?: string;
  body_fr?: string;
  ctaLabel_fr?: string;
  // EN translation
  title_en?: string;
  body_en?: string;
  ctaLabel_en?: string;
};

// ─── Sun City presets ─────────────────────────────────────────────────────────
const PRESETS = [
  {
    slug: 'pride',
    label: '🏳️‍🌈 Pride Month',
    start: '06-01', end: '06-30',
    prompt: 'Hero banner pour Sun City Paris – sauna gay – Pride Month : couleurs arc-en-ciel, foule festive et sensuelle, atmosphère chaude et inclusive, esthétique queer moderne, fond sombre lumineux',
  },
  {
    slug: 'pool',
    label: '🏊 Pool Party',
    start: '07-01', end: '08-31',
    prompt: 'Hero banner Sun City Paris – Pool Party estivale : vapeur de sauna, eau turquoise, lumières tamisées, ambiance décontractée et sexy, hommes souriants, teintes bleu/or',
  },
  {
    slug: 'nasty',
    label: '🔥 Nasty Boys',
    start: '', end: '',
    prompt: 'Hero banner Sun City Paris – Nasty Boys : ambiance dark room, néons rouges et violets intenses, silhouettes masculines, esthétique underground fetish élégant, très photographique',
  },
  {
    slug: 'bears',
    label: '🐻 Bears',
    start: '', end: '',
    prompt: 'Hero banner Sun City Paris – Bear Party : chaleureuse, conviviale, bois sombre et cuir, lumières ambrées, hommes barbus souriants, ambiance sauna confort et bienveillance',
  },
  {
    slug: 'gtd',
    label: '☕ GTD Tea Dance',
    start: '', end: '',
    prompt: 'Hero banner Sun City Paris – GTD Tea Dance dimanche après-midi : boule à facettes, piste de danse lumineuse, ambiance décontractée et joyeuse, couleurs dorées et rose poudré',
  },
  {
    slug: 'karaoke',
    label: '🎤 Karaoké',
    start: '', end: '',
    prompt: 'Hero banner Sun City Paris – Soirée Karaoké : microphone sur scène, lumières colorées, participants qui chantent et rient, ambiance festive et camp, esthétique pop vivante',
  },
  {
    slug: 'bollywood',
    label: '🪔 Bollywood Party',
    start: '', end: '',
    prompt: 'Hero banner Sun City Paris – Bollywood Party : couleurs saturées rose, orange, violet, dorures et étoffes indiennes, lumières de fête, fusion queer et bollywood, décor somptueux',
  },
  {
    slug: 'halloween',
    label: '🎃 Halloween',
    start: '10-25', end: '11-01',
    prompt: 'Hero banner Sun City Paris – Halloween : fog machine, citrouilles orange, néons verts, esthétique horror chic queer, ombres dramatiques, décor sauna transformé en repaire obscur',
  },
  {
    slug: 'valentin',
    label: '💝 Saint Valentin',
    start: '02-10', end: '02-15',
    prompt: 'Hero banner Sun City Paris – Saint Valentin : tons roses et fuchsia chauds, coeurs lumineux, atmosphère romantique et sensuelle, ambiance sauna tamisée, esthétique valentins queer',
  },
  {
    slug: 'nouvel_an',
    label: '✨ Nouvel An',
    start: '12-28', end: '01-02',
    prompt: 'Hero banner Sun City Paris – Réveillon du Nouvel An : champagne, confettis dorés et argentés, compte à rebours lumineux, ambiance sauna de fête, foule élégante en célébration',
  },
  {
    slug: 'ete',
    label: '🌅 Été',
    start: '06-21', end: '09-21',
    prompt: 'Hero banner Sun City Paris – Ambiance Été : lumière solaire dorée filtrée, vapeur douce, peaux bronzées, sérénité et désir, teintes chaudes ambrées, esthétique sauna méditerranéen',
  },
  {
    slug: 'hiver',
    label: '❄️ Hiver',
    start: '12-01', end: '02-28',
    prompt: 'Hero banner Sun City Paris – Ambiance Hiver : chaleur du sauna contrastant avec froid dehors, lumières cosy orangées, vapeur enveloppante, sensation de refuge et de cocon intime',
  },
  {
    slug: 'agenda',
    label: '📅 Agenda du jour',
    start: '', end: '',
    prompt: 'Hero banner Sun City Paris – Agenda événements : composition graphique épurée avec dates et silhouettes masculines stylisées, palette or #C9A24B et magenta #FF006E, typographie moderne',
  },
] as const;

type PresetSlug = (typeof PRESETS)[number]['slug'];

// ─── Sun City swatches ────────────────────────────────────────────────────────
const SWATCHES = [
  { color: '#C9A24B', label: 'Or Sun' },
  { color: '#FF006E', label: 'Magenta' },
  { color: '#00F0FF', label: 'Cyan' },
  { color: '#FFEE00', label: 'Jaune acid' },
  { color: '#00FF41', label: 'Vert acid' },
  { color: '#FFE5A0', label: 'Moon' },
];

// ─── Default CTA suggestions ──────────────────────────────────────────────────
const CTA_SUGGESTIONS = [
  { label: 'VOIR L\'AGENDA', url: '/agenda' },
  { label: 'BILLETTERIE', url: '/billetterie' },
  { label: 'RÉSERVER', url: '/billetterie' },
  { label: 'INFOS', url: '/horaires-acces' },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface BannerEditorProps {
  banner?: BannerRich | null;
  onClose: () => void;
  onSaved: (b: BannerRich) => void;
}

export function BannerEditor({ banner, onClose, onSaved }: BannerEditorProps) {
  // Content state
  const [eyebrow, setEyebrow] = useState(banner?.eyebrow ?? '');
  const [titleFr, setTitleFr] = useState(banner?.title_fr ?? '');
  const [bodyFr, setBodyFr] = useState(banner?.body_fr ?? '');
  const [ctaLabelFr, setCtaLabelFr] = useState(banner?.ctaLabel_fr ?? '');
  const [titleEn, setTitleEn] = useState(banner?.title_en ?? '');
  const [bodyEn, setBodyEn] = useState(banner?.body_en ?? '');
  const [ctaLabelEn, setCtaLabelEn] = useState(banner?.ctaLabel_en ?? '');

  // Media state
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl ?? '');
  const [videoUrl, setVideoUrl] = useState(banner?.videoUrl ?? '');
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>('image');
  const [uploadBusy, setUploadBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // CTAs
  const [ctaUrl, setCtaUrl] = useState(banner?.ctaUrl ?? '');
  const [ctaUrl2, setCtaUrl2] = useState(banner?.ctaUrl2 ?? '');
  const [ctaLabel2, setCtaLabel2] = useState(banner?.ctaLabel2 ?? '');

  // Accent color
  const [accentColor, setAccentColor] = useState(banner?.accentColor ?? '#C9A24B');

  // Save state
  const [busy, setBusy] = useState(false);

  // AI generation
  const [presetSlug, setPresetSlug] = useState<PresetSlug | ''>(
    (banner?.presetSlug as PresetSlug) ?? ''
  );
  const [aiPrompt, setAiPrompt] = useState(banner?.aiPrompt ?? '');
  const [aiBusy, setAiBusy] = useState<'image' | 'video' | null>(null);
  const [aiPreview, setAiPreview] = useState<{ data: string; mimeType: string }[]>([]);
  const [hfModel, setHfModel] = useState<'higgsfield-lite' | 'higgsfield-standard' | 'higgsfield-turbo'>('higgsfield-lite');
  const [hfDuration, setHfDuration] = useState(5);
  const [hfMotion, setHfMotion] = useState<'low' | 'medium' | 'high'>('medium');
  const [hfLoop, setHfLoop] = useState(true);

  // Provider availability + selection
  const [providers, setProviders] = useState<ProvidersAvailability>({
    image: { gemini: true, higgsfield: true, picsum: true },
    video: { veo: true, higgsfield: true, sample: true },
  });
  const [imageProvider, setImageProvider] = useState<ImageProvider>('gemini');
  const [videoProvider, setVideoProvider] = useState<VideoProvider>('veo');
  const [lastUsedProvider, setLastUsedProvider] = useState<{ kind: 'image' | 'video'; slug: string; label: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/banners/providers')
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (cancelled || !j?.ok || !j.providers) return;
        const av: ProvidersAvailability = {
          image: {
            gemini: !!j.providers.image?.gemini,
            higgsfield: !!j.providers.image?.higgsfield,
            picsum: j.providers.image?.picsum !== false,
          },
          video: {
            veo: !!j.providers.video?.veo,
            higgsfield: !!j.providers.video?.higgsfield,
            sample: j.providers.video?.sample !== false,
          },
        };
        setProviders(av);
        // Pick best default for image
        if (av.image.gemini) setImageProvider('gemini');
        else if (av.image.higgsfield) setImageProvider('higgsfield');
        else setImageProvider('picsum');
        // Pick best default for video
        if (av.video.veo) setVideoProvider('veo');
        else if (av.video.higgsfield) setVideoProvider('higgsfield');
        else setVideoProvider('sample');
      })
      .catch(() => { /* keep optimistic defaults */ });
    return () => { cancelled = true; };
  }, []);

  // Activation calendar
  const [activeFrom, setActiveFrom] = useState(
    banner?.startsAt ? new Date(banner.startsAt).toISOString().slice(0, 16) : ''
  );
  const [activeUntil, setActiveUntil] = useState(
    banner?.endsAt ? new Date(banner.endsAt).toISOString().slice(0, 16) : ''
  );
  const [themeSlug, setThemeSlug] = useState(banner?.themeSlug ?? '');

  // Misc
  const [position, setPosition] = useState(banner?.position ?? 'hero');
  const [active, setActive] = useState(banner?.active ?? true);
  const [slug, setSlug] = useState(banner?.slug ?? '');

  // ── Preset application ──────────────────────────────────────────────────────
  function applyPreset(ps: PresetSlug) {
    const p = PRESETS.find(x => x.slug === ps);
    if (!p) return;
    setPresetSlug(ps);
    if (p.start && p.end) {
      const year = new Date().getFullYear();
      setActiveFrom(`${year}-${p.start}T00:00`);
      setActiveUntil(`${year}-${p.end}T23:59`);
    }
    setAiPrompt(p.prompt);
  }

  // ── Media upload ────────────────────────────────────────────────────────────
  async function uploadMedia(file: File) {
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/banners/upload', { method: 'POST', body: fd });
      const j = await r.json();
      if (j.ok && j.url) {
        if (file.type.startsWith('video/')) {
          setVideoUrl(j.url);
          setMediaTab('video');
        } else {
          setImageUrl(j.url);
          setMediaTab('image');
        }
      } else {
        alert('Erreur upload : ' + (j.error ?? 'inconnue'));
      }
    } finally {
      setUploadBusy(false);
    }
  }

  // ── AI generation ───────────────────────────────────────────────────────────
  async function generateAI(kind: 'image' | 'video') {
    setAiBusy(kind);
    setAiPreview([]);
    try {
      const endpoint = kind === 'image'
        ? '/api/banners/generate-image'
        : '/api/banners/generate-video';
      const provider = kind === 'image' ? imageProvider : videoProvider;
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt || `Bannière Sun City Paris ${presetSlug}`,
          preset: presetSlug || undefined,
          count: 2,
          provider,
          higgsfield: kind === 'video'
            ? { model: hfModel, duration: hfDuration, motion: hfMotion, loop: hfLoop }
            : undefined,
        }),
      });
      const j = await r.json().catch(() => ({ error: `Réponse invalide HTTP ${r.status}` }));
      if (!r.ok || !j.ok) {
        alert(j.error ?? `Génération échouée (HTTP ${r.status})`);
        return;
      }
      const usedSlug: string = j.provider ?? provider;
      const def = kind === 'image'
        ? IMAGE_PROVIDERS.find(p => p.slug === usedSlug)
        : VIDEO_PROVIDERS.find(p => p.slug === usedSlug);
      setLastUsedProvider({ kind, slug: usedSlug, label: def?.label ?? usedSlug });
      if (kind === 'video' && j.videoUrl) {
        setVideoUrl(j.videoUrl);
        setMediaTab('video');
      } else {
        setAiPreview(j.images ?? []);
      }
    } catch (e: unknown) {
      alert('Erreur réseau : ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setAiBusy(null);
    }
  }

  async function useAiImage(img: { data: string; mimeType: string }) {
    // Save the base64 image to storage via API
    setUploadBusy(true);
    try {
      const r = await fetch('/api/banners/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: img.data, mimeType: img.mimeType, name: presetSlug || 'banner-ai' }),
      });
      const j = await r.json();
      if (j.ok && j.url) {
        setImageUrl(j.url);
        setMediaTab('image');
        setAiPreview([]);
      }
    } finally {
      setUploadBusy(false);
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function save() {
    if (!titleFr && !slug) return;
    setBusy(true);
    const url = banner ? `/api/banners/${banner.id}` : '/api/banners';
    const method = banner ? 'PATCH' : 'POST';
    try {
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || titleFr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          position,
          active,
          eyebrow: eyebrow || null,
          imageUrl: imageUrl || null,
          videoUrl: videoUrl || null,
          accentColor: accentColor || null,
          themeSlug: themeSlug || null,
          ctaUrl: ctaUrl || null,
          ctaUrl2: ctaUrl2 || null,
          ctaLabel2: ctaLabel2 || null,
          aiPrompt: aiPrompt || null,
          presetSlug: presetSlug || null,
          startsAt: activeFrom || null,
          endsAt: activeUntil || null,
          // Translations
          title_fr: titleFr,
          body_fr: bodyFr || null,
          ctaLabel_fr: ctaLabelFr || null,
          title_en: titleEn || null,
          body_en: bodyEn || null,
          ctaLabel_en: ctaLabelEn || null,
        }),
      });
      const j = await r.json();
      if (j.ok && j.banner) {
        onSaved(j.banner);
      } else {
        alert(j.error ?? 'Erreur lors de la sauvegarde');
      }
    } finally {
      setBusy(false);
    }
  }

  const currentMedia = mediaTab === 'video' ? videoUrl : imageUrl;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bgAlt border border-border rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border flex items-center justify-between px-5 py-3.5">
          <h2 className="font-display text-lg">
            {banner ? 'Éditer la bannière' : 'Nouvelle bannière'}
          </h2>
          <button onClick={onClose} className="text-textMuted hover:text-text">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">

          {/* Meta row */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-textMuted block mb-1">Slug</label>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="auto-généré depuis le titre"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-textMuted block mb-1">Position</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="hero">hero (slide principal)</option>
                <option value="top">top (marquee)</option>
                <option value="agenda-banner">agenda-banner</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm self-end pb-2">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="accent-primary"
              />
              <span>Actif</span>
            </label>
          </div>

          {/* Eyebrow */}
          <input
            value={eyebrow}
            onChange={e => setEyebrow(e.target.value)}
            placeholder="Sur-titre — ex : SOIRÉE EXCLUSIVE, ÉVÉNEMENT DU MOIS…"
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs uppercase tracking-widest"
          />

          {/* Translations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-textMuted">FR</p>
              <input
                value={titleFr}
                onChange={e => setTitleFr(e.target.value)}
                placeholder="Titre principal (FR)"
                required
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-bold"
              />
              <textarea
                value={bodyFr}
                onChange={e => setBodyFr(e.target.value)}
                rows={2}
                placeholder="Description (FR)"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={ctaLabelFr}
                onChange={e => setCtaLabelFr(e.target.value)}
                placeholder="Label CTA 1 (FR)"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-textMuted">EN</p>
              <input
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                placeholder="Main title (EN)"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-bold"
              />
              <textarea
                value={bodyEn}
                onChange={e => setBodyEn(e.target.value)}
                rows={2}
                placeholder="Description (EN)"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={ctaLabelEn}
                onChange={e => setCtaLabelEn(e.target.value)}
                placeholder="CTA 1 label (EN)"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Media upload */}
          <div className="bg-bg border border-border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMediaTab('image')}
                  className={`text-xs px-2.5 py-1 rounded-full ${mediaTab === 'image' ? 'bg-primary text-bg font-bold' : 'text-textMuted hover:text-text'}`}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('video')}
                  className={`text-xs px-2.5 py-1 rounded-full ${mediaTab === 'video' ? 'bg-primary text-bg font-bold' : 'text-textMuted hover:text-text'}`}
                >
                  Vidéo
                </button>
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadBusy}
                className="btn-ghost text-xs flex items-center gap-1"
              >
                {uploadBusy ? <Loader2 size={11} className="animate-spin" /> : <UploadCloud size={11} />}
                Téléverser
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={e => e.target.files?.[0] && uploadMedia(e.target.files[0])}
              />
            </div>
            {currentMedia ? (
              <div className="rounded-lg overflow-hidden bg-bg max-h-40">
                {mediaTab === 'video'
                  ? <video src={currentMedia} controls className="w-full max-h-40" />
                  // eslint-disable-next-line @next/next/no-img-element
                  : <img src={currentMedia} alt="" className="w-full max-h-40 object-cover" />
                }
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-textMuted border border-dashed border-border rounded-lg">
                <ImageIcon size={28} className="opacity-40" />
              </div>
            )}
            {mediaTab === 'image' && (
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="URL image (optionnel si téléversé)"
                className="w-full bg-bgAlt border border-border rounded-lg px-3 py-2 text-xs font-mono"
              />
            )}
            {mediaTab === 'video' && (
              <input
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="URL vidéo (optionnel si téléversée)"
                className="w-full bg-bgAlt border border-border rounded-lg px-3 py-2 text-xs font-mono"
              />
            )}
          </div>

          {/* CTAs */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-textMuted">Liens CTA</p>
            <div className="flex flex-wrap gap-1 mb-1">
              {CTA_SUGGESTIONS.map(s => (
                <button
                  key={s.url + s.label}
                  type="button"
                  onClick={() => { setCtaLabelFr(s.label); setCtaUrl(s.url); }}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-bgAlt border border-border hover:border-primary text-textMuted hover:text-text"
                >
                  {s.label} → {s.url}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={ctaUrl}
                onChange={e => setCtaUrl(e.target.value)}
                placeholder="URL CTA 1 (ex: /agenda)"
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={ctaLabel2}
                onChange={e => setCtaLabel2(e.target.value)}
                placeholder="Bouton 2 — texte"
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={ctaUrl2}
                onChange={e => setCtaUrl2(e.target.value)}
                placeholder="URL CTA 2 (ex: /billetterie)"
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Accent color */}
          <div>
            <label className="text-xs text-textMuted block mb-1">Couleur d'accent</label>
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm font-mono w-32"
              />
              {SWATCHES.map(sw => (
                <button
                  key={sw.color}
                  type="button"
                  title={sw.label}
                  onClick={() => setAccentColor(sw.color)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: sw.color,
                    borderColor: accentColor === sw.color ? 'white' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── AI Generator ── */}
          <div className="border border-primary/30 bg-primary/5 rounded-xl p-3 space-y-2">
            <div className="text-xs uppercase font-bold text-primary flex items-center gap-1.5">
              ✨ Générer avec Higgsfield AI (image + vidéo)
            </div>

            {/* Preset pills */}
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => applyPreset(p.slug)}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                    presetSlug === p.slug
                      ? 'bg-primary text-bg font-bold'
                      : 'bg-bgAlt text-textMuted hover:text-text border border-border'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Provider selectors */}
            <div className="space-y-1.5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-textMuted mb-1">Provider image</p>
                <div className="flex flex-wrap gap-1.5">
                  {IMAGE_PROVIDERS.map(p => {
                    const available = providers.image[p.slug];
                    const selected = imageProvider === p.slug;
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => available && setImageProvider(p.slug)}
                        disabled={!available}
                        title={available ? p.label : 'Clé API non configurée'}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                          selected
                            ? 'bg-primary text-bg border-primary font-bold'
                            : 'bg-bg border-border text-textMuted hover:text-text'
                        } ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {p.short}{!available && p.slug !== 'picsum' ? ' (clé manquante)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-textMuted mb-1">Provider vidéo</p>
                <div className="flex flex-wrap gap-1.5">
                  {VIDEO_PROVIDERS.map(p => {
                    const available = providers.video[p.slug];
                    const selected = videoProvider === p.slug;
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => available && setVideoProvider(p.slug)}
                        disabled={!available}
                        title={available ? p.label : 'Clé API non configurée'}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                          selected
                            ? 'bg-primary text-bg border-primary font-bold'
                            : 'bg-bg border-border text-textMuted hover:text-text'
                        } ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {p.short}{!available && p.slug !== 'sample' ? ' (clé manquante)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Prompt */}
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              rows={2}
              placeholder="Prompt IA (choisir un preset le remplit automatiquement, modifiable librement)"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs"
            />

            {/* Generate buttons */}
            <div className="flex gap-2 flex-wrap items-center">
              <button
                type="button"
                onClick={() => generateAI('image')}
                disabled={!!aiBusy}
                className="bg-primary hover:opacity-90 disabled:opacity-50 text-bg text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
              >
                {aiBusy === 'image' ? <Loader2 size={11} className="animate-spin" /> : '🖼'}
                {aiBusy === 'image'
                  ? 'Génération…'
                  : `Générer image (${IMAGE_PROVIDERS.find(p => p.slug === imageProvider)?.short ?? imageProvider})`}
              </button>
              <button
                type="button"
                onClick={() => generateAI('video')}
                disabled={!!aiBusy}
                className="bg-secondary hover:opacity-90 disabled:opacity-50 text-bg text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
              >
                {aiBusy === 'video' ? <Loader2 size={11} className="animate-spin" /> : '🎥'}
                {aiBusy === 'video'
                  ? 'Génération…'
                  : `Générer vidéo (${VIDEO_PROVIDERS.find(p => p.slug === videoProvider)?.short ?? videoProvider})`}
              </button>
              {lastUsedProvider && (
                <span className="text-[10px] text-success font-medium">
                  Généré via {lastUsedProvider.label} ✓
                </span>
              )}
            </div>

            {/* Higgsfield video params */}
            <details className="bg-bg/60 border border-border rounded-lg p-2.5">
              <summary className="cursor-pointer text-[11px] font-bold text-secondary hover:opacity-80">
                ▸ Paramètres vidéo Higgsfield
              </summary>
              <div className="grid grid-cols-2 gap-2 mt-2.5 text-[11px]">
                <label className="flex flex-col gap-1">
                  <span className="text-textMuted">Modèle</span>
                  <select
                    value={hfModel}
                    onChange={e => setHfModel(e.target.value as typeof hfModel)}
                    className="bg-bgAlt border border-border rounded px-2 py-1 text-text"
                  >
                    <option value="higgsfield-lite">Lite (rapide, 5s max)</option>
                    <option value="higgsfield-standard">Standard (qualité sup., 10s)</option>
                    <option value="higgsfield-turbo">Turbo (ultra rapide, 5s)</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-textMuted">Durée (s)</span>
                  <input
                    type="number" min={3} max={10} step={1}
                    value={hfDuration}
                    onChange={e => setHfDuration(parseInt(e.target.value) || 5)}
                    className="bg-bgAlt border border-border rounded px-2 py-1 text-text"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-textMuted">Intensité mouvement</span>
                  <select
                    value={hfMotion}
                    onChange={e => setHfMotion(e.target.value as typeof hfMotion)}
                    className="bg-bgAlt border border-border rounded px-2 py-1 text-text"
                  >
                    <option value="low">Faible (doux, atmosphérique)</option>
                    <option value="medium">Moyen (équilibré)</option>
                    <option value="high">Fort (cinématique)</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 self-end pb-1">
                  <input
                    type="checkbox"
                    checked={hfLoop}
                    onChange={e => setHfLoop(e.target.checked)}
                    className="accent-secondary"
                  />
                  <span className="text-textMuted">Boucle parfaite (recommandé bannière)</span>
                </label>
              </div>
              <p className="text-[10px] text-textMuted mt-2">
                Clés à configurer dans <code className="text-primary">/admin/settings → Higgsfield</code>
                (HIGGSFIELD_API_KEY_ID + HIGGSFIELD_API_KEY_SECRET).
                Sans clés : stub Unsplash pour images, vidéo sample pour vidéos.
              </p>
            </details>

            {/* AI previews */}
            {aiPreview.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {aiPreview.map((img, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:${img.mimeType};base64,${img.data}`}
                      alt=""
                      className="w-full aspect-video object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => useAiImage(img)}
                      className="absolute bottom-1.5 right-1.5 bg-success hover:opacity-90 text-bg text-[10px] font-bold px-2.5 py-1 rounded-full"
                    >
                      ✓ Utiliser
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Activation calendar ── */}
          <div className="border border-secondary/30 bg-secondary/5 rounded-xl p-3 space-y-2">
            <div className="text-xs uppercase font-bold text-secondary">📅 Calendrier d'activation</div>
            <p className="text-[10px] text-textMuted">
              Si vide : bannière toujours visible. Si rempli : affichée uniquement entre ces dates.
              Sélectionner un preset ci-dessus remplit automatiquement les dates.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[9px] uppercase text-textMuted block mb-0.5">Active du</span>
                <input
                  type="datetime-local"
                  value={activeFrom}
                  onChange={e => setActiveFrom(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-2 py-1.5 text-xs"
                />
              </label>
              <label className="block">
                <span className="text-[9px] uppercase text-textMuted block mb-0.5">Jusqu'au</span>
                <input
                  type="datetime-local"
                  value={activeUntil}
                  onChange={e => setActiveUntil(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-2 py-1.5 text-xs"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-[9px] uppercase text-textMuted block mb-0.5">
                OU lier à un thème (slug)
              </span>
              <input
                value={themeSlug}
                onChange={e => setThemeSlug(e.target.value)}
                placeholder="ex: pride-rainbow, halloween-dark, nouvel-an…"
                className="w-full bg-bg border border-border rounded-lg px-2 py-1.5 text-xs font-mono"
              />
            </label>
            <p className="text-[9px] text-textMuted">
              Si lié à un thème : la bannière s'active dès que le thème est actif (manuel ou auto-date).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3.5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost text-sm">Annuler</button>
          <button
            onClick={save}
            disabled={busy || (!titleFr && !slug)}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            {busy ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {banner ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}
