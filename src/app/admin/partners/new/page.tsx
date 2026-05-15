import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { createPartner } from '../actions';
import SubmitButton from '@/components/admin/SubmitButton';

export default async function NewPartner() {
  await requireAdmin();
  async function action(fd: FormData) { 'use server'; await createPartner(fd); redirect('/admin/partners'); }
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-6">Nouveau partenaire</h1>
      <form action={action} className="space-y-3">
        <div><label className="block text-sm mb-1">Nom</label><input name="name" required className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">URL</label><input name="url" type="url" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Logo URL</label><input name="logoUrl" type="url" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Catégorie</label><select name="category" className="w-full bg-bgAlt border border-border rounded px-3 py-2"><option value="prevention">prevention</option><option value="media">media</option><option value="sister-venue">sister-venue</option><option value="">autre</option></select></div>
        <div><label className="block text-sm mb-1">Order</label><input name="orderIndex" type="number" defaultValue="0" className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Actif</label>
        <SubmitButton>Créer</SubmitButton>
      </form>
    </div>
  );
}
