import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const loc = await prisma.location.findUnique({
    where: { slug },
    include: { translations: { where: { locale: locale as any } } },
  });
  const tr = loc?.translations[0];
  if (!tr) return { title: 'Sun City Paris' };
  return { title: `${tr.title} — Sun City Paris`, description: tr.summary };
}

export default async function LocationDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const loc = await prisma.location.findUnique({
    where: { slug },
    include: { translations: { where: { locale: locale as any } } },
  });
  const tr = loc?.translations[0];
  if (!loc || !tr) notFound();

  return (
    <article className="section max-w-prose">
      <Link href="/lieux" className="text-sm text-textMuted hover:text-primary">← {locale === 'fr' ? 'Tous les lieux' : 'All places'}</Link>
      <h1 className="font-display text-4xl md:text-5xl mt-4 mb-3">{tr.title}</h1>
      <p className="text-lg text-textMuted mb-8">{tr.summary}</p>
      <div className="prose prose-invert max-w-none whitespace-pre-line">{tr.contentMd}</div>
    </article>
  );
}
