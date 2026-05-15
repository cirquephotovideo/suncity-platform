import SubmitButton from './SubmitButton';

export default function EventForm({ defaults, action }: {
  defaults?: any;
  action: (fd: FormData) => Promise<any>;
}) {
  const d = defaults ?? {};
  return (
    <form action={action as any} className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">Slug</label><input name="slug" defaultValue={d.slug ?? ''} required className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono" /></div>
        <div>
          <label className="block text-sm mb-1">Statut</label>
          <select name="status" defaultValue={d.status ?? 'PUBLISHED'} className="w-full bg-bgAlt border border-border rounded px-3 py-2">
            <option>DRAFT</option><option>PUBLISHED</option><option>CANCELLED</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">Début</label><input type="datetime-local" name="startsAt" defaultValue={d.startsAt ?? ''} required className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Fin (optionnel)</label><input type="datetime-local" name="endsAt" defaultValue={d.endsAt ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      </div>
      <div><label className="block text-sm mb-1">URL externe</label><input name="externalUrl" defaultValue={d.externalUrl ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      <div><label className="block text-sm mb-1">Image cover (URL)</label><input name="coverImageUrl" defaultValue={d.coverImageUrl ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">FR</p>
          <input name="title_fr" defaultValue={d.title_fr ?? ''} placeholder="Titre" required className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="summary_fr" defaultValue={d.summary_fr ?? ''} rows={2} placeholder="Résumé" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="content_fr" defaultValue={d.content_fr ?? ''} rows={6} placeholder="Contenu Markdown" className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono text-xs" />
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">EN</p>
          <input name="title_en" defaultValue={d.title_en ?? ''} placeholder="Title" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="summary_en" defaultValue={d.summary_en ?? ''} rows={2} placeholder="Summary" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="content_en" defaultValue={d.content_en ?? ''} rows={6} placeholder="Markdown content" className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono text-xs" />
        </div>
      </div>
      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
