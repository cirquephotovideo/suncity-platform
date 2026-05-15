import SubmitButton from './SubmitButton';
export default function LocationForm({ defaults, action }: { defaults?: any; action: (fd: FormData) => Promise<any> }) {
  const d = defaults ?? {};
  return (
    <form action={action as any} className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-3 gap-3">
        <div><label className="block text-sm mb-1">Slug</label><input name="slug" defaultValue={d.slug ?? ''} required className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono" /></div>
        <div><label className="block text-sm mb-1">Icon (Lucide)</label><input name="iconKey" defaultValue={d.iconKey ?? ''} placeholder="flame" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Order</label><input name="orderIndex" type="number" defaultValue={d.orderIndex ?? 0} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      </div>
      <div><label className="block text-sm mb-1">Image cover (URL)</label><input name="coverImageUrl" defaultValue={d.coverImageUrl ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={d.active ?? true} /> Actif</label>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">FR</p>
          <input name="title_fr" defaultValue={d.title_fr ?? ''} placeholder="Titre" required className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="summary_fr" defaultValue={d.summary_fr ?? ''} rows={2} placeholder="Résumé" required className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="contentMd_fr" defaultValue={d.contentMd_fr ?? ''} rows={8} placeholder="Contenu Markdown" required className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono text-xs" />
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">EN</p>
          <input name="title_en" defaultValue={d.title_en ?? ''} placeholder="Title" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="summary_en" defaultValue={d.summary_en ?? ''} rows={2} placeholder="Summary" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="contentMd_en" defaultValue={d.contentMd_en ?? ''} rows={8} placeholder="Markdown content" className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono text-xs" />
        </div>
      </div>
      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
