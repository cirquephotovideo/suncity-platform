'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Save, Loader2, UploadCloud, MapPin, Phone, Mail,
  Globe, Search, Palette, Plug, Send, FileText, Settings as SettingsIcon,
  Eye, EyeOff,
} from 'lucide-react';
import { SKINS, SKIN_KEYS } from '@/lib/skins';

type Settings = {
  siteName?: string | null;
  baseline_fr?: string | null;
  baseline_en?: string | null;
  defaultLocale?: 'fr' | 'en';
  timezone?: string | null;
  currency?: string | null;
  ageGateEnabled?: boolean;
  ageGateMinAge?: number;
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  rcs?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHoursJson?: any;
  socialJson?: any;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  robotsNoIndex?: boolean;
  gaId?: string | null;
  plausibleDomain?: string | null;
  schemaOrgType?: string | null;
  themeKey?: string;
  stripePublicKey?: string | null;
  resendApiKeySet?: boolean;
  minioBucket?: string | null;
  telegramBotTokenSet?: boolean;
  mailSenderName?: string | null;
  mailSenderEmail?: string | null;
  mailFooterFr?: string | null;
  mailFooterEn?: string | null;
  doubleOptIn?: boolean;
  consentText?: string | null;
  footerHtmlFr?: string | null;
  footerHtmlEn?: string | null;
  copyrightText?: string | null;
  partnersJson?: any;
  legalLinksJson?: any;
};

type Tab =
  | 'general' | 'contact' | 'social' | 'seo' | 'theme'
  | 'integrations' | 'mailing' | 'footer';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'general', label: 'Général', icon: SettingsIcon },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'social', label: 'Social', icon: Globe },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'theme', label: 'Thème', icon: Palette },
  { id: 'integrations', label: 'Intégrations', icon: Plug },
  { id: 'mailing', label: 'Mailing', icon: Send },
  { id: 'footer', label: 'Footer', icon: FileText },
];

const DAYS_FR: Record<string, string> = {
  monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi',
  friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche',
};

interface Props {
  initial: Settings;
  themeOptions?: { key: string; label: string }[];
}

export default function SettingsForm({ initial, themeOptions }: Props) {
  const [tab, setTab] = useState<Tab>('general');
  const [data, setData] = useState<Settings>(initial);
  const [savedTab, setSavedTab] = useState<Tab | null>(null);
  const [savingTab, setSavingTab] = useState<Tab | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function saveTab(activeTab: Tab, payload: Partial<Settings>) {
    setSavingTab(activeTab);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, tab: activeTab }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || 'erreur');
      // merge returned (sanitized) settings
      setData((d) => ({ ...d, ...j.settings }));
      setSavedTab(activeTab);
      setTimeout(() => setSavedTab(null), 2200);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSavingTab(null);
    }
  }

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-6">
      {/* Tabs */}
      <nav className="space-y-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition ${
              tab === id
                ? 'bg-primary/15 border border-primary/40 text-primary'
                : 'border border-transparent hover:bg-bgAlt text-textMuted hover:text-text'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <section className="bg-bgAlt border border-border rounded-lg p-5 min-h-[420px]">
        {error && (
          <div className="mb-4 p-3 rounded border border-red-500/40 bg-red-500/10 text-red-300 text-sm">
            {error}
          </div>
        )}

        {tab === 'general' && (
          <GeneralTab data={data} set={set} themeOptions={themeOptions} />
        )}
        {tab === 'contact' && <ContactTab data={data} set={set} />}
        {tab === 'social' && <SocialTab data={data} set={set} />}
        {tab === 'seo' && <SeoTab data={data} set={set} />}
        {tab === 'theme' && <ThemeTab data={data} set={set} />}
        {tab === 'integrations' && <IntegrationsTab data={data} set={set} />}
        {tab === 'mailing' && <MailingTab data={data} set={set} />}
        {tab === 'footer' && <FooterTab data={data} set={set} />}

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <div className="text-xs text-textMuted">
            {savedTab === tab && (
              <span className="text-primary">Enregistré ✓</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => saveTab(tab, payloadForTab(tab, data))}
            disabled={savingTab === tab}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded text-sm disabled:opacity-60"
          >
            {savingTab === tab ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Enregistrer ce panneau
          </button>
        </div>
      </section>
    </div>
  );
}

function payloadForTab(tab: Tab, d: Settings): Partial<Settings> {
  switch (tab) {
    case 'general':
      return {
        siteName: d.siteName, baseline_fr: d.baseline_fr, baseline_en: d.baseline_en,
        defaultLocale: d.defaultLocale, timezone: d.timezone, currency: d.currency,
        ageGateEnabled: d.ageGateEnabled, ageGateMinAge: d.ageGateMinAge,
      };
    case 'contact':
      return {
        contactPhone: d.contactPhone, contactEmail: d.contactEmail, address: d.address,
        rcs: d.rcs, latitude: d.latitude, longitude: d.longitude,
        openingHoursJson: d.openingHoursJson,
      };
    case 'social':
      return { socialJson: d.socialJson };
    case 'seo':
      return {
        seoTitle: d.seoTitle, seoDescription: d.seoDescription, ogImageUrl: d.ogImageUrl,
        robotsNoIndex: d.robotsNoIndex, gaId: d.gaId, plausibleDomain: d.plausibleDomain,
        schemaOrgType: d.schemaOrgType,
      };
    case 'theme':
      return { themeKey: d.themeKey };
    case 'integrations': {
      // Only include secrets if user actually entered new values (we use SECRET marker via DOM)
      const out: any = {
        stripePublicKey: d.stripePublicKey,
        minioBucket: d.minioBucket,
      };
      const resend = (document.getElementById('s-resend') as HTMLInputElement | null)?.value || '';
      const tg = (document.getElementById('s-telegram') as HTMLInputElement | null)?.value || '';
      if (resend) out.resendApiKey = resend;
      if (tg) out.telegramBotToken = tg;
      return out;
    }
    case 'mailing':
      return {
        mailSenderName: d.mailSenderName, mailSenderEmail: d.mailSenderEmail,
        mailFooterFr: d.mailFooterFr, mailFooterEn: d.mailFooterEn,
        doubleOptIn: d.doubleOptIn, consentText: d.consentText,
      };
    case 'footer':
      return {
        footerHtmlFr: d.footerHtmlFr, footerHtmlEn: d.footerHtmlEn,
        copyrightText: d.copyrightText, legalLinksJson: d.legalLinksJson,
      };
  }
}

// ─────────────── General ───────────────
function GeneralTab({ data, set, themeOptions }: any) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl flex items-center gap-2">
        <SettingsIcon size={18} /> Général
      </h2>
      <Field label="Nom du sauna">
        <input value={data.siteName ?? ''} onChange={(e) => set('siteName', e.target.value)}
          className="input" placeholder="Sun City Paris" />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Baseline (FR)">
          <input value={data.baseline_fr ?? ''} onChange={(e) => set('baseline_fr', e.target.value)} className="input" />
        </Field>
        <Field label="Baseline (EN)">
          <input value={data.baseline_en ?? ''} onChange={(e) => set('baseline_en', e.target.value)} className="input" />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Langue par défaut">
          <select value={data.defaultLocale ?? 'fr'} onChange={(e) => set('defaultLocale', e.target.value)} className="input">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </Field>
        <Field label="Fuseau horaire">
          <input value={data.timezone ?? 'Europe/Paris'} onChange={(e) => set('timezone', e.target.value)} className="input" />
        </Field>
        <Field label="Devise">
          <select value={data.currency ?? 'EUR'} onChange={(e) => set('currency', e.target.value)} className="input">
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-border">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!data.ageGateEnabled}
            onChange={(e) => set('ageGateEnabled', e.target.checked)} />
          Activer le age-gate
        </label>
        <Field label="Âge minimum">
          <input type="number" value={data.ageGateMinAge ?? 18}
            onChange={(e) => set('ageGateMinAge', Number(e.target.value))}
            className="input" />
        </Field>
      </div>
    </div>
  );
}

// ─────────────── Contact ───────────────
function ContactTab({ data, set }: any) {
  const lat = data.latitude ?? '';
  const lng = data.longitude ?? '';
  const hours = data.openingHoursJson ?? {};

  function setHour(day: string, value: string) {
    const next = { ...(data.openingHoursJson ?? {}), [day]: value };
    set('openingHoursJson', next);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl flex items-center gap-2"><Phone size={18} /> Contact</h2>
      <Field label="Adresse complète">
        <textarea value={data.address ?? ''} onChange={(e) => set('address', e.target.value)}
          rows={2} className="input" />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Téléphone">
          <input value={data.contactPhone ?? ''} onChange={(e) => set('contactPhone', e.target.value)} className="input" />
        </Field>
        <Field label="Email contact">
          <input type="email" value={data.contactEmail ?? ''} onChange={(e) => set('contactEmail', e.target.value)} className="input" />
        </Field>
      </div>
      <Field label="RCS / mentions société">
        <input value={data.rcs ?? ''} onChange={(e) => set('rcs', e.target.value)} className="input" />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Latitude">
          <input value={String(lat)} onChange={(e) => set('latitude', e.target.value === '' ? null : Number(e.target.value))} className="input" placeholder="48.8566" />
        </Field>
        <Field label="Longitude">
          <input value={String(lng)} onChange={(e) => set('longitude', e.target.value === '' ? null : Number(e.target.value))} className="input" placeholder="2.3522" />
        </Field>
      </div>
      {typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) && (
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <MapPin size={12} /> Voir sur OpenStreetMap
        </a>
      )}

      <div className="pt-3 border-t border-border">
        <h3 className="text-sm font-semibold mb-2">Horaires d'ouverture</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.keys(DAYS_FR).map((day) => (
            <div key={day} className="flex items-center gap-2">
              <label className="w-24 text-xs text-textMuted">{DAYS_FR[day]}</label>
              <input
                value={hours[day] ?? ''}
                onChange={(e) => setHour(day, e.target.value)}
                placeholder="22:00 - 06:00"
                className="input flex-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────── Social ───────────────
function SocialTab({ data, set }: any) {
  const social = data.socialJson ?? {};
  const update = (k: string, v: string) => set('socialJson', { ...social, [k]: v });
  const PLATFORMS = [
    ['instagram', 'Instagram'],
    ['twitter', 'Twitter / X'],
    ['facebook', 'Facebook'],
    ['tiktok', 'TikTok'],
    ['youtube', 'YouTube'],
    ['telegram', 'Telegram'],
  ];
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl flex items-center gap-2"><Globe size={18} /> Réseaux sociaux</h2>
      {PLATFORMS.map(([k, label]) => (
        <Field key={k} label={label}>
          <input value={social[k] ?? ''} onChange={(e) => update(k, e.target.value)} className="input" placeholder="https://..." />
        </Field>
      ))}
    </div>
  );
}

// ─────────────── SEO ───────────────
function SeoTab({ data, set }: any) {
  const ogRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function uploadOg(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/settings/upload-og', { method: 'POST', body: fd });
      const j = await res.json();
      if (j.ok) set('ogImageUrl', j.url);
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl flex items-center gap-2"><Search size={18} /> SEO</h2>
      <Field label="Meta title (par défaut)">
        <input value={data.seoTitle ?? ''} onChange={(e) => set('seoTitle', e.target.value)} className="input" />
      </Field>
      <Field label="Meta description">
        <textarea value={data.seoDescription ?? ''} onChange={(e) => set('seoDescription', e.target.value)} rows={2} className="input" />
      </Field>
      <Field label="Image Open Graph (1200×630)">
        <div className="flex items-center gap-3">
          {data.ogImageUrl && (
            <img src={data.ogImageUrl} alt="" className="h-20 w-36 object-cover rounded border border-border" />
          )}
          <button type="button" onClick={() => ogRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded border border-border hover:bg-bg text-sm"
            disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            {data.ogImageUrl ? 'Remplacer' : 'Uploader une image'}
          </button>
          <input ref={ogRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadOg(f); }} />
          {data.ogImageUrl && (
            <button type="button" onClick={() => set('ogImageUrl', '')}
              className="text-xs text-textMuted hover:text-red-400">Retirer</button>
          )}
        </div>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!data.robotsNoIndex} onChange={(e) => set('robotsNoIndex', e.target.checked)} />
        Bloquer l'indexation par les moteurs (robots noindex)
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Google Analytics ID"><input value={data.gaId ?? ''} onChange={(e) => set('gaId', e.target.value)} className="input" placeholder="G-XXXXXXX" /></Field>
        <Field label="Plausible domain"><input value={data.plausibleDomain ?? ''} onChange={(e) => set('plausibleDomain', e.target.value)} className="input" placeholder="suncity.paris" /></Field>
      </div>
      <Field label="Type schema.org">
        <select value={data.schemaOrgType ?? ''} onChange={(e) => set('schemaOrgType', e.target.value)} className="input">
          <option value="">— aucun —</option>
          <option value="NightClub">NightClub</option>
          <option value="HealthClub">HealthClub</option>
          <option value="LocalBusiness">LocalBusiness</option>
          <option value="Organization">Organization</option>
        </select>
      </Field>
    </div>
  );
}

// ─────────────── Theme ───────────────
function ThemeTab({ data, set }: any) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl flex items-center gap-2"><Palette size={18} /> Skin du site</h2>
      <p className="text-sm text-textMuted">Choisis l'apparence par défaut. Voir aussi <a href="/admin/skins" className="text-primary hover:underline">/admin/skins</a> pour la preview détaillée.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SKIN_KEYS.map((key) => {
          const skin = SKINS[key];
          const active = data.themeKey === key;
          return (
            <label key={key}
              className={`flex gap-3 p-3 rounded border cursor-pointer transition ${
                active ? 'border-primary bg-primary/10' : 'border-border hover:bg-bg'
              }`}>
              <input type="radio" name="themeKey" value={key} checked={active}
                onChange={() => set('themeKey', key)} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{skin.emoji}</span>
                  <span className="font-semibold">{skin.label}</span>
                </div>
                <p className="text-xs text-textMuted mt-1">{skin.vibe}</p>
                <div className="flex gap-1 mt-2">
                  <span className="w-5 h-5 rounded" style={{ background: skin.bg, border: '1px solid #444' }} title="bg" />
                  <span className="w-5 h-5 rounded" style={{ background: skin.accent }} title="accent" />
                  <span className="w-5 h-5 rounded" style={{ background: skin.fg, border: '1px solid #444' }} title="fg" />
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────── Integrations ───────────────
function IntegrationsTab({ data, set }: any) {
  const [revealResend, setRevealResend] = useState(false);
  const [revealTg, setRevealTg] = useState(false);
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl flex items-center gap-2"><Plug size={18} /> Intégrations</h2>
      <div className="bg-bg border border-border rounded p-3">
        <div className="text-sm font-semibold mb-2">Stripe</div>
        <Field label="Clé publique (pk_…)">
          <input value={data.stripePublicKey ?? ''} onChange={(e) => set('stripePublicKey', e.target.value)} className="input" placeholder="pk_live_..." />
        </Field>
      </div>
      <div className="bg-bg border border-border rounded p-3">
        <div className="text-sm font-semibold mb-2 flex items-center justify-between">
          Resend (email)
          <span className="text-xs text-textMuted">{data.resendApiKeySet ? 'Configuré ✓' : 'non configuré'}</span>
        </div>
        <Field label="Resend API key (sera chiffrée)">
          <div className="flex gap-2">
            <input id="s-resend" type={revealResend ? 'text' : 'password'} className="input flex-1" placeholder="re_..." defaultValue="" />
            <button type="button" onClick={() => setRevealResend(v => !v)} className="px-2 py-1 text-textMuted hover:text-text border border-border rounded">
              {revealResend ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Field>
      </div>
      <div className="bg-bg border border-border rounded p-3">
        <div className="text-sm font-semibold mb-2">MinIO / S3</div>
        <Field label="Bucket">
          <input value={data.minioBucket ?? ''} onChange={(e) => set('minioBucket', e.target.value)} className="input" placeholder="suncity" />
        </Field>
      </div>
      <div className="bg-bg border border-border rounded p-3">
        <div className="text-sm font-semibold mb-2 flex items-center justify-between">
          Telegram bot
          <span className="text-xs text-textMuted">{data.telegramBotTokenSet ? 'Configuré ✓' : 'non configuré'}</span>
        </div>
        <Field label="Bot token (sera chiffré)">
          <div className="flex gap-2">
            <input id="s-telegram" type={revealTg ? 'text' : 'password'} className="input flex-1" placeholder="123456:ABC..." defaultValue="" />
            <button type="button" onClick={() => setRevealTg(v => !v)} className="px-2 py-1 text-textMuted hover:text-text border border-border rounded">
              {revealTg ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Field>
      </div>
    </div>
  );
}

// ─────────────── Mailing ───────────────
function MailingTab({ data, set }: any) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl flex items-center gap-2"><Send size={18} /> Mailing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Nom expéditeur">
          <input value={data.mailSenderName ?? ''} onChange={(e) => set('mailSenderName', e.target.value)} className="input" placeholder="Sun City Paris" />
        </Field>
        <Field label="Email expéditeur">
          <input type="email" value={data.mailSenderEmail ?? ''} onChange={(e) => set('mailSenderEmail', e.target.value)} className="input" placeholder="hello@suncity.paris" />
        </Field>
      </div>
      <Field label="Pied de mail HTML (FR)">
        <textarea value={data.mailFooterFr ?? ''} onChange={(e) => set('mailFooterFr', e.target.value)} rows={4} className="input font-mono text-xs" />
      </Field>
      <Field label="Pied de mail HTML (EN)">
        <textarea value={data.mailFooterEn ?? ''} onChange={(e) => set('mailFooterEn', e.target.value)} rows={4} className="input font-mono text-xs" />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!data.doubleOptIn} onChange={(e) => set('doubleOptIn', e.target.checked)} />
        Double opt-in pour la newsletter
      </label>
      <Field label="Texte de consentement (RGPD)">
        <textarea value={data.consentText ?? ''} onChange={(e) => set('consentText', e.target.value)} rows={3} className="input" />
      </Field>
    </div>
  );
}

// ─────────────── Footer ───────────────
function FooterTab({ data, set }: any) {
  const links = (data.legalLinksJson ?? []) as { label: string; href: string }[];
  function updateLink(i: number, k: 'label' | 'href', v: string) {
    const next = [...links];
    next[i] = { ...next[i], [k]: v };
    set('legalLinksJson', next);
  }
  function addLink() { set('legalLinksJson', [...links, { label: '', href: '' }]); }
  function removeLink(i: number) {
    const next = [...links];
    next.splice(i, 1);
    set('legalLinksJson', next);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl flex items-center gap-2"><FileText size={18} /> Footer</h2>
      <Field label="HTML personnalisé (FR)">
        <textarea value={data.footerHtmlFr ?? ''} onChange={(e) => set('footerHtmlFr', e.target.value)} rows={5} className="input font-mono text-xs" />
      </Field>
      <Field label="HTML personnalisé (EN)">
        <textarea value={data.footerHtmlEn ?? ''} onChange={(e) => set('footerHtmlEn', e.target.value)} rows={5} className="input font-mono text-xs" />
      </Field>
      <Field label="Texte copyright">
        <input value={data.copyrightText ?? ''} onChange={(e) => set('copyrightText', e.target.value)} className="input" placeholder="© 2026 Sun City Paris" />
      </Field>

      <div className="bg-bg border border-border rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Liens légaux</span>
          <button type="button" onClick={addLink} className="text-xs text-primary hover:underline">+ Ajouter</button>
        </div>
        {links.length === 0 && <p className="text-xs text-textMuted">Aucun lien.</p>}
        {links.map((l, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={l.label ?? ''} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="Mentions légales" className="input flex-1" />
            <input value={l.href ?? ''} onChange={(e) => updateLink(i, 'href', e.target.value)} placeholder="/mentions-legales" className="input flex-1" />
            <button type="button" onClick={() => removeLink(i)} className="text-textMuted hover:text-red-400 text-xs px-2">×</button>
          </div>
        ))}
      </div>

      <p className="text-xs text-textMuted">
        Pour gérer les partenaires, voir <a href="/admin/partners" className="text-primary hover:underline">/admin/partners</a>.
      </p>
    </div>
  );
}

// ─────────────── Field helper ───────────────
function Field({ label, children }: { label: string; children: any }) {
  return (
    <label className="block">
      <span className="block text-xs text-textMuted mb-1">{label}</span>
      {children}
    </label>
  );
}
