import SubmitButton from './SubmitButton';
export default function CampaignForm({ defaults, action }: { defaults?: any; action: (fd: FormData) => Promise<any> }) {
  const d = defaults ?? {};
  return (
    <form action={action as any} className="space-y-4 max-w-3xl">
      <div><label className="block text-sm mb-1">Sujet</label><input name="subject" defaultValue={d.subject ?? ''} required className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      <div><label className="block text-sm mb-1">Programmé pour (optionnel)</label><input type="datetime-local" name="scheduledAt" defaultValue={d.scheduledAt ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
      <div><label className="block text-sm mb-1">Contenu HTML</label><textarea name="contentHtml" rows={20} defaultValue={d.contentHtml ?? ''} required className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono text-xs" /></div>
      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
