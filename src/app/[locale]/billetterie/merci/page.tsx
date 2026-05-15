import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { CheckCircle2 } from 'lucide-react';

export default async function MerciPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ session_id?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { session_id } = await searchParams;

  let order: any = null;
  if (session_id) {
    order = await prisma.order.findUnique({
      where: { stripeCheckoutId: session_id },
      include: { items: { include: { product: { include: { translations: { where: { locale: locale as any } } } } } } },
    }).catch(() => null);
  }

  return (
    <section className="section max-w-2xl text-center">
      <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-6" />
      <h1 className="font-display text-4xl md:text-5xl mb-4">{locale === 'fr' ? 'Merci !' : 'Thank you!'}</h1>
      <p className="text-textMuted mb-8">
        {locale === 'fr'
          ? 'Ton paiement est confirmé. Un email avec ton QR code arrive dans ta boîte (vérifie tes spams).'
          : 'Your payment is confirmed. An email with your QR code is on its way (check your spam).'}
      </p>
      {order ? (
        <div className="bg-bgAlt border border-border rounded-xl p-6 text-left mb-8">
          <p className="text-xs text-textMuted">N° {order.number}</p>
          <ul className="mt-3 space-y-1">
            {order.items.map((it: any) => (
              <li key={it.id} className="flex justify-between text-sm">
                <span>{it.quantity}× {it.product.translations[0]?.title ?? it.product.slug}</span>
                <span className="text-primary">{(it.totalCents / 100).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
        </div>
      ) : session_id && (
        <div className="bg-bgAlt border border-border rounded-xl p-6 mb-8 text-sm text-textMuted">
          {locale === 'fr' ? 'Confirmation en cours…' : 'Confirmation in progress…'}
        </div>
      )}
      <Link href="/" className="btn-primary">{locale === 'fr' ? 'Retour à l\'accueil' : 'Back home'}</Link>
    </section>
  );
}
