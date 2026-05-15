import SubmitButton from './SubmitButton';

export default function BannerForm({ defaults, action }: { defaults?: any; action: (fd: FormData) => Promise<any> }) {
  const d = defaults ?? {};
  function dt(v: any) { return v ? new Date(v).toISOString().slice(0, 16) : ''; }
  return (
    <form action={action as any} className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">Slug</label><input name="slug" defaultValue={d.slug ?? ''} required className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono" /></div>
        <div>
          <label className="block text-sm mb-1">Position</label>
          <select name="position" defaultValue={d.position ?? 'top'} className="w-full bg-bgAlt border border-border rounded px-3 py-2">
            <option value="top">top (marquee)</option>
            <option value="hero">hero (slide principal)</option>
            <option value="agenda-banner">agenda-banner</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">Valide à partir de</label><input type="datetime-local" name="startsAt" defaultValue={dt(d.startsAt)} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Valide jusqu'à</label><input type="datetime-local" name="endsAt" defaultValue={dt(d.endsAt)} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">URL CTA (optionnel)</label><input name="ctaUrl" defaultValue={d.ctaUrl ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Image URL (optionnel, pour hero)</label><input name="imageUrl" defaultValue={d.imageUrl ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={d.active ?? true} /> Actif</label>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">FR</p>
          <input name="title_fr" defaultValue={d.title_fr ?? ''} placeholder="Titre" required className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="body_fr" defaultValue={d.body_fr ?? ''} rows={3} placeholder="Texte (optionnel)" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <input name="ctaLabel_fr" defaultValue={d.ctaLabel_fr ?? ''} placeholder="Label CTA (optionnel)" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">EN</p>
          <input name="title_en" defaultValue={d.title_en ?? ''} placeholder="Title" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="body_en" defaultValue={d.body_en ?? ''} rows={3} placeholder="Text" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <input name="ctaLabel_en" defaultValue={d.ctaLabel_en ?? ''} placeholder="CTA label" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
        </div>
      </div>
      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
