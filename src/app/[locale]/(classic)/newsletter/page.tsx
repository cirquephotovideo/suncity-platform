import { getTranslations, setRequestLocale } from 'next-intl/server';
import NewsletterForm from '@/components/NewsletterForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'newsletterPage' });
  return { title: `${t('title')} — Sun City Paris`, description: t('body') };
}

export default async function NewsletterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('newsletterPage');
  return (
    <section className="section max-w-xl">
      <p className="eyebrow mb-3">Sun City</p>
      <h1 className="font-display text-4xl md:text-5xl mb-4">{t('title')}</h1>
      <p className="text-textMuted mb-8">{t('body')}</p>
      <NewsletterForm />
    </section>
  );
}
