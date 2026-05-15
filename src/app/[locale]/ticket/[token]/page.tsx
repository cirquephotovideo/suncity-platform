import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { CheckCircle2, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TicketPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const item = await prisma.orderItem.findUnique({
    where: { qrCodeToken: token },
    include: {
      order: true,
      product: { include: { translations: { where: { locale: locale as any } } } },
      variant: true,
    },
  });

  if (!item || item.order.status !== 'PAID') notFound();

  const productTitle = item.product.translations[0]?.title ?? item.product.slug;

  return (
    <section className="section max-w-md text-center">
      <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-6" />
      <h1 className="font-display text-3xl mb-2">{locale === 'fr' ? 'Ton entrée Sun City' : 'Your Sun City entry'}</h1>
      <p className="font-mono text-xs text-textMuted mb-8">{item.order.number}</p>

      <div className="bg-bgAlt border border-primary rounded-xl p-8 mb-8 shadow-[0_0_60px_rgba(201,162,75,0.3)]">
        <p className="font-display text-2xl text-primary mb-2">{productTitle}</p>
        <p className="text-sm text-textMuted mb-6">{item.variant.label}</p>
        <div className="bg-cream-light rounded-lg p-6">
          <img alt="QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://sun.pixeeplay.com'}/fr/ticket/${token}`)}`} className="mx-auto" />
        </div>
        <p className="text-xs text-textMuted mt-4">
          {locale === 'fr' ? 'Présente ce QR à l\'accueil' : 'Show this QR at reception'}
        </p>
      </div>

      <div className="bg-bgAlt border border-border rounded-lg p-5 text-sm text-left">
        <p className="flex items-start gap-2 mb-2"><MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />62 boulevard de Sébastopol, 75003 Paris</p>
        <p className="text-textMuted">📞 01 40 09 26 09</p>
        <p className="text-textMuted">⏰ Ouvert 7/7 12h-2h (6h ven/sam)</p>
      </div>
    </section>
  );
}
