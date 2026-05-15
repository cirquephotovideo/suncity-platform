import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function CmsPage({ slug, locale }: { slug: string; locale: string }) {
  const page = await prisma.page.findUnique({
    where: { slug_locale: { slug, locale: locale as any } },
  });
  if (!page || page.status !== 'PUBLISHED') notFound();

  return (
    <article className="section max-w-prose">
      <p className="eyebrow mb-3">Sun City</p>
      <h1 className="font-display text-4xl md:text-5xl mb-4">{page.title}</h1>
      {page.excerpt && <p className="text-lg text-textMuted mb-8">{page.excerpt}</p>}
      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.contentHtml ?? '' }} />
    </article>
  );
}
