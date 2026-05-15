import SubmitButton from './SubmitButton';
const KINDS = ['TICKET_DAY','TICKET_EVENING','PASS_MULTI','SUBSCRIPTION','GIFT_CARD'];
export default function ProductForm({ defaults, action }: { defaults?: any; action: (fd: FormData) => Promise<any> }) {
  const d = defaults ?? {};
  return (
    <form action={action as any} className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">Slug</label><input name="slug" defaultValue={d.slug ?? ''} required className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono" /></div>
        <div><label className="block text-sm mb-1">Type</label><select name="kind" defaultValue={d.kind ?? 'TICKET_DAY'} className="w-full bg-bgAlt border border-border rounded px-3 py-2">{KINDS.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
      </div>
      <div><label className="block text-sm mb-1">Image cover (URL)</label><input name="coverImageUrl" defaultValue={d.coverImageUrl ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={d.active ?? true} /> Actif</label>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">FR</p>
          <input name="title_fr" defaultValue={d.title_fr ?? ''} placeholder="Titre" required className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="description_fr" defaultValue={d.description_fr ?? ''} rows={4} placeholder="Description" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">EN</p>
          <input name="title_en" defaultValue={d.title_en ?? ''} placeholder="Title" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="description_en" defaultValue={d.description_en ?? ''} rows={4} placeholder="Description" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
        </div>
      </div>
      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
