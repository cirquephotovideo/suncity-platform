import { setRequestLocale } from 'next-intl/server';
import { CmsPage } from '@/components/CmsPage';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const page = await prisma.page.findUnique({ where: { slug_locale: { slug: 'reglement', locale: locale as any } } });
  return { title: `${page?.title ?? 'Sun City Paris'} — Sun City Paris`, description: page?.excerpt ?? undefined };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CmsPage slug="reglement" locale={locale} />;
}
