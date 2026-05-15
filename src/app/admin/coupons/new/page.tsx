import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { createCoupon } from '../actions';
import SubmitButton from '@/components/admin/SubmitButton';

export default async function NewCoupon() {
  await requireAdmin();
  async function action(fd: FormData) { 'use server'; await createCoupon(fd); redirect('/admin/coupons'); }
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-6">Nouveau coupon</h1>
      <form action={action} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-sm mb-1">Code</label><input name="code" required className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono uppercase" /></div>
          <div><label className="block text-sm mb-1">Type</label><select name="kind" className="w-full bg-bgAlt border border-border rounded px-3 py-2"><option value="PERCENT">% remise</option><option value="AMOUNT_CENTS">€ fixe</option></select></div>
          <div><label className="block text-sm mb-1">Valeur</label><input name="value" type="number" required className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm mb-1">Valide à partir de</label><input name="validFrom" type="datetime-local" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
          <div><label className="block text-sm mb-1">Valide jusqu'à</label><input name="validUntil" type="datetime-local" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        </div>
        <div><label className="block text-sm mb-1">Max utilisations (optionnel)</label><input name="maxRedemptions" type="number" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Actif</label>
        <SubmitButton>Créer</SubmitButton>
      </form>
    </div>
  );
}
