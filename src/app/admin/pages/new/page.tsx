import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { createPage } from '../actions';
import SubmitButton from '@/components/admin/SubmitButton';

export default async function NewPage() {
  await requireAdmin();

  async function action(formData: FormData) {
    'use server';
    const res = await createPage(formData);
    if (res.ok) redirect(`/admin/pages/${res.id}`);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Nouvelle page</h1>
      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Slug</label>
          <input name="slug" required className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono" placeholder="ma-nouvelle-page" />
        </div>
        <div>
          <label className="block text-sm mb-1">Locale</label>
          <select name="locale" className="w-full bg-bgAlt border border-border rounded px-3 py-2">
            <option value="fr">FR</option><option value="en">EN</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Titre</label>
          <input name="title" required className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Excerpt</label>
          <textarea name="excerpt" rows={2} className="w-full bg-bgAlt border border-border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Contenu HTML</label>
          <textarea name="contentHtml" rows={10} className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono text-sm" />
        </div>
        <SubmitButton>Créer</SubmitButton>
      </form>
    </div>
  );
}
