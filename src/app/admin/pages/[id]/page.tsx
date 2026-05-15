import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { updatePage, publishPage } from '../actions';
import SubmitButton from '@/components/admin/SubmitButton';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  async function save(formData: FormData) {
    'use server';
    await updatePage(id, formData);
  }

  return (
    <div className="max-w-3xl">
      <p className="text-sm text-textMuted mb-2">/{page.locale}/{page.slug} — <span className={page.status === 'PUBLISHED' ? 'text-success' : 'text-textMuted'}>{page.status}</span></p>
      <h1 className="font-display text-3xl mb-6">{page.title}</h1>
      <form action={save} className="space-y-4">
        <div><label className="block text-sm mb-1">Titre</label><input name="title" defaultValue={page.title} required className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Excerpt</label><textarea name="excerpt" rows={2} defaultValue={page.excerpt ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2" /></div>
        <div><label className="block text-sm mb-1">Contenu HTML</label><textarea name="contentHtml" rows={16} defaultValue={page.contentHtml ?? ''} className="w-full bg-bgAlt border border-border rounded px-3 py-2 font-mono text-xs" /></div>
        <details className="bg-bgAlt border border-border rounded p-3 text-sm">
          <summary className="cursor-pointer text-textMuted">SEO</summary>
          <div className="mt-3 space-y-3">
            <div><label className="block text-xs mb-1">SEO Title</label><input name="seoTitle" defaultValue={page.seoTitle ?? ''} className="w-full bg-bg border border-border rounded px-3 py-2" /></div>
            <div><label className="block text-xs mb-1">SEO Description</label><textarea name="seoDesc" rows={2} defaultValue={page.seoDesc ?? ''} className="w-full bg-bg border border-border rounded px-3 py-2" /></div>
          </div>
        </details>
        <div className="flex gap-2 pt-2">
          <SubmitButton>Enregistrer</SubmitButton>
          {page.status !== 'PUBLISHED' && (
            <form action={publishPage.bind(null, page.id)}><SubmitButton className="btn-outline">Publier</SubmitButton></form>
          )}
        </div>
      </form>
    </div>
  );
}
