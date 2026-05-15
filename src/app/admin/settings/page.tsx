import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { updateSettings } from './actions';
import SubmitButton from '@/components/admin/SubmitButton';

export default async function SettingsPage() {
  await requireAdmin();
  const [s, themes] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.theme.findMany({ where: { active: true } }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-6">Paramètres du site</h1>
      <form action={updateSettings} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm mb-1">Téléphone</label><input name="contactPhone" defaultValue={s?.contactPhone ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
          <div><label className="block text-sm mb-1">Email contact</label><input name="contactEmail" defaultValue={s?.contactEmail ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        </div>
        <div><label className="block text-sm mb-1">Adresse</label><input name="address" defaultValue={s?.address ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">RCS / mentions société</label><input name="rcs" defaultValue={s?.rcs ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>

        <details className="bg-bgAlt border border-border rounded p-3">
          <summary className="cursor-pointer text-sm">Horaires (JSON)</summary>
          <textarea name="openingHoursJson" rows={8} defaultValue={JSON.stringify(s?.openingHoursJson ?? {}, null, 2)} className="w-full bg-bg border border-border rounded px-3 py-2 mt-3 font-mono text-xs" />
        </details>
        <details className="bg-bgAlt border border-border rounded p-3">
          <summary className="cursor-pointer text-sm">Réseaux sociaux (JSON)</summary>
          <textarea name="socialJson" rows={4} defaultValue={JSON.stringify(s?.socialJson ?? {}, null, 2)} className="w-full bg-bg border border-border rounded px-3 py-2 mt-3 font-mono text-xs" />
        </details>
        <details className="bg-bgAlt border border-border rounded p-3">
          <summary className="cursor-pointer text-sm">Partenaires (JSON)</summary>
          <textarea name="partnersJson" rows={6} defaultValue={JSON.stringify(s?.partnersJson ?? [], null, 2)} className="w-full bg-bg border border-border rounded px-3 py-2 mt-3 font-mono text-xs" />
        </details>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="ageGateEnabled" defaultChecked={s?.ageGateEnabled ?? true} /> Age-gate</label>
          <div><label className="block text-xs mb-1">Âge min</label><input name="ageGateMinAge" type="number" defaultValue={s?.ageGateMinAge ?? 18} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
          <div><label className="block text-xs mb-1">Locale par défaut</label><select name="defaultLocale" defaultValue={s?.defaultLocale ?? 'fr'} className="w-full bg-bgAlt border border-border rounded px-3 py-2"><option value="fr">FR</option><option value="en">EN</option></select></div>
        </div>

        <div><label className="block text-sm mb-1">Thème actif</label>
          <select name="themeKey" defaultValue={s?.themeKey ?? 'sun'} className="w-full bg-bgAlt border border-border rounded px-3 py-2">
            {themes.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>

        <SubmitButton>Enregistrer</SubmitButton>
      </form>
    </div>
  );
}
