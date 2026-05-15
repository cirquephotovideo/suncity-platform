import { setRequestLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/format';
import BuyButton from '@/components/BuyButton';
import { isStripeReady } from '@/lib/stripe';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: locale === 'fr' ? 'Billetterie — Sun City Paris' : 'Tickets — Sun City Paris' };
}

export default async function BilletteriePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const stripeReady = isStripeReady();

  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      translations: { where: { locale: locale as any } },
      variants: { where: { active: true }, orderBy: { orderIndex: 'asc' } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <section className="section">
      <p className="eyebrow mb-3">Sun City</p>
      <h1 className="font-display text-4xl md:text-5xl mb-4">{locale === 'fr' ? 'Billetterie en ligne' : 'Online tickets'}</h1>
      <p className="text-textMuted max-w-2xl mb-10">
        {locale === 'fr'
          ? 'Achète ton entrée en quelques clics. Reçois ton QR code par email. Scan-le à l’arrivée pour skipper la file.'
          : 'Buy your entry in clicks. Get your QR code by email. Scan it on arrival to skip the queue.'}
      </p>

      {!stripeReady && (
        <div className="bg-warning/10 border border-warning/40 text-warning rounded-lg p-4 mb-6 text-sm">
          ⚠️ {locale === 'fr' ? 'Paiement Stripe pas encore configuré côté serveur. Les boutons ne fonctionneront pas.' : 'Stripe is not configured yet on the server. Buttons will not work.'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => {
          const tr = p.translations[0];
          if (!tr) return null;
          return (
            <article key={p.id} className="bg-bgAlt border border-border rounded-xl overflow-hidden flex flex-col">
              {p.coverImageUrl && <img src={p.coverImageUrl} alt={tr.title} className="aspect-video object-cover" />}
              <div className="p-5 flex flex-col flex-1">
                <span className="eyebrow mb-2">{p.kind.replace(/_/g, ' ').toLowerCase()}</span>
                <h3 className="font-display text-2xl mb-2">{tr.title}</h3>
                {tr.description && <p className="text-sm text-textMuted mb-4 flex-1">{tr.description}</p>}
                <div className="border-t border-border pt-4 space-y-2">
                  {p.variants.map(v => (
                    <div key={v.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm">{v.label}</p>
                        <p className="text-primary font-semibold">{formatPrice(v.priceCents, locale === 'fr' ? 'fr-FR' : 'en-GB')}</p>
                      </div>
                      <BuyButton variantId={v.id} disabled={!stripeReady} label={locale === 'fr' ? 'Acheter' : 'Buy'} />
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12 bg-bgAlt border border-border rounded-xl p-6 text-sm text-textMuted">
        <h3 className="font-display text-lg text-text mb-2">ℹ️ {locale === 'fr' ? 'Comment ça marche' : 'How it works'}</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>{locale === 'fr' ? 'Choisis ton entrée et clique « Acheter ».' : 'Pick your entry and click "Buy".'}</li>
          <li>{locale === 'fr' ? 'Renseigne ton email + ta CB sur le formulaire Stripe sécurisé.' : 'Fill in your email + card on the secure Stripe form.'}</li>
          <li>{locale === 'fr' ? 'Reçois ton QR code par email immédiatement.' : 'Get your QR code by email immediately.'}</li>
          <li>{locale === 'fr' ? 'Scan le QR à l’accueil. Pas besoin de file d’attente, pas besoin de cash.' : 'Scan QR at reception. No queue, no cash needed.'}</li>
        </ol>
      </div>
    </section>
  );
}
