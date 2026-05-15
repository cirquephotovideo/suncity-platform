import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Gift } from 'lucide-react';

export default async function MerciGift({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="section max-w-xl text-center">
      <Gift className="w-16 h-16 text-primary mx-auto mb-6" />
      <h1 className="font-display text-4xl mb-4">{locale === 'fr' ? 'Carte cadeau envoyée 🎁' : 'Gift card sent 🎁'}</h1>
      <p className="text-textMuted mb-8">
        {locale === 'fr'
          ? 'Le destinataire (ou toi-même si pas de destinataire) reçoit la carte par email dans les minutes qui suivent.'
          : 'The recipient (or you if none specified) gets the card by email within minutes.'}
      </p>
      <Link href="/" className="btn-primary">{locale === 'fr' ? 'Retour à l\'accueil' : 'Back home'}</Link>
    </section>
  );
}
