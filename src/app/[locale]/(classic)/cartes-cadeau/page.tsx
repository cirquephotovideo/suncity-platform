import { setRequestLocale } from 'next-intl/server';
import { Gift } from 'lucide-react';
import GiftCardForm from '@/components/GiftCardForm';
import { isStripeReady } from '@/lib/stripe';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: locale === 'fr' ? 'Cartes cadeau — Sun City Paris' : 'Gift cards — Sun City Paris' };
}

export default async function GiftCardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const stripeReady = isStripeReady();

  return (
    <section className="section max-w-2xl">
      <div className="text-center mb-8">
        <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
        <p className="eyebrow mb-3">Sun City</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">{locale === 'fr' ? 'Cartes cadeau' : 'Gift cards'}</h1>
        <p className="text-textMuted">
          {locale === 'fr'
            ? 'Offre une expérience Sun City à un proche. Carte envoyée par email avec un code unique, valable 1 an.'
            : 'Gift a Sun City experience to a loved one. Sent by email with a unique code, valid 1 year.'}
        </p>
      </div>

      {!stripeReady && (
        <div className="bg-warning/10 border border-warning/40 text-warning rounded-lg p-4 mb-6 text-sm">
          ⚠️ {locale === 'fr' ? 'Paiement Stripe pas encore configuré.' : 'Stripe not configured yet.'}
        </div>
      )}

      <GiftCardForm locale={locale} disabled={!stripeReady} />

      <div className="mt-8 bg-bgAlt border border-border rounded-xl p-5 text-sm text-textMuted">
        <p className="font-medium text-text mb-2">ℹ️ {locale === 'fr' ? 'Comment ça marche' : 'How it works'}</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{locale === 'fr' ? 'Choisis le montant (10€ à 200€).' : 'Pick the amount (€10 to €200).'}</li>
          <li>{locale === 'fr' ? 'Renseigne le destinataire (optionnel — sinon tu reçois la carte toi-même).' : 'Fill in the recipient (optional — otherwise you get it yourself).'}</li>
          <li>{locale === 'fr' ? 'Paie en ligne via Stripe (sécurisé).' : 'Pay online via Stripe (secure).'}</li>
          <li>{locale === 'fr' ? 'La carte arrive par email immédiatement avec un code unique.' : 'Card arrives by email immediately with a unique code.'}</li>
          <li>{locale === 'fr' ? 'Valable 1 an, utilisable à l\'accueil ou sur la billetterie en ligne.' : 'Valid 1 year, usable at reception or on online tickets.'}</li>
        </ul>
      </div>
    </section>
  );
}
