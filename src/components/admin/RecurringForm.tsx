import SubmitButton from './SubmitButton';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const WOMS = ['ALL','ODD','EVEN','W1','W2','W3','W4','W5'];

export default function RecurringForm({ defaults, action }: {
  defaults?: Partial<{
    slug: string; dayOfWeek: string; weekOfMonth: string; startTime: string; endTime: string;
    priceLabel: string; hostedBy: string; externalUrl: string; active: boolean; orderIndex: number;
    title_fr: string; summary_fr: string; title_en: string; summary_en: string;
  }>;
  action: (fd: FormData) => Promise<void> | Promise<string | null>;
}) {
  const d = defaults ?? {};
  return (
    <form action={action as any} className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">Slug</label><input name="slug" defaultValue={d.slug ?? ''} required className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono" /></div>
        <div><label className="block text-sm mb-1">Order</label><input name="orderIndex" type="number" defaultValue={d.orderIndex ?? 0} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">Jour</label><select name="dayOfWeek" defaultValue={d.dayOfWeek ?? 'MONDAY'} className="w-full bg-bgAlt border border-border rounded px-3 py-2">{DAYS.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
        <div><label className="block text-sm mb-1">Semaine</label><select name="weekOfMonth" defaultValue={d.weekOfMonth ?? 'ALL'} className="w-full bg-bgAlt border border-border rounded px-3 py-2">{WOMS.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">Heure début</label><input name="startTime" defaultValue={d.startTime ?? '12:00'} required placeholder="12:00" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Heure fin</label><input name="endTime" defaultValue={d.endTime ?? ''} placeholder="02:00" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm mb-1">Tarif (label)</label><input name="priceLabel" defaultValue={d.priceLabel ?? ''} placeholder="18 €" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Hosted by</label><input name="hostedBy" defaultValue={d.hostedBy ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      </div>
      <div><label className="block text-sm mb-1">URL externe</label><input name="externalUrl" defaultValue={d.externalUrl ?? ''} placeholder="https://…" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={d.active ?? true} /> Actif</label>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">FR</p>
          <input name="title_fr" defaultValue={d.title_fr ?? ''} placeholder="Titre FR" required className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="summary_fr" defaultValue={d.summary_fr ?? ''} rows={3} placeholder="Résumé FR" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">EN</p>
          <input name="title_en" defaultValue={d.title_en ?? ''} placeholder="Title EN" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="summary_en" defaultValue={d.summary_en ?? ''} rows={3} placeholder="Summary EN" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
        </div>
      </div>

      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
