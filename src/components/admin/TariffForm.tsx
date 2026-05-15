import SubmitButton from './SubmitButton';
const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

export default function TariffForm({ defaults, action }: { defaults?: any; action: (fd: FormData) => Promise<any> }) {
  const d = defaults ?? {};
  const sel = new Set<string>(d.daysApplicable ?? []);
  return (
    <form action={action as any} className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-3 gap-3">
        <div><label className="block text-sm mb-1">Code</label><input name="code" defaultValue={d.code ?? ''} required className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono" /></div>
        <div><label className="block text-sm mb-1">Prix (centimes)</label><input name="priceCents" type="number" min="0" defaultValue={d.priceCents ?? 2200} required className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Order</label><input name="orderIndex" type="number" defaultValue={d.orderIndex ?? 0} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      </div>
      <div>
        <label className="block text-sm mb-2">Jours applicables</label>
        <div className="flex flex-wrap gap-3 text-sm">
          {DAYS.map(day => (
            <label key={day} className="flex items-center gap-1.5">
              <input type="checkbox" name="daysApplicable" value={day} defaultChecked={sel.has(day)} />
              <span>{day}</span>
            </label>
          ))}
        </div>
      </div>
      <div><label className="block text-sm mb-1">Condition (label libre)</label><input name="conditionLabel" defaultValue={d.conditionLabel ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={d.active ?? true} /> Actif</label>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">FR</p>
          <input name="label_fr" defaultValue={d.label_fr ?? ''} placeholder="Label FR" required className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="details_fr" defaultValue={d.details_fr ?? ''} rows={2} placeholder="Détails FR" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-textMuted">EN</p>
          <input name="label_en" defaultValue={d.label_en ?? ''} placeholder="Label EN" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
          <textarea name="details_en" defaultValue={d.details_en ?? ''} rows={2} placeholder="Details EN" className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
        </div>
      </div>
      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
