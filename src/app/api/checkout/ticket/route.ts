import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe, isStripeReady } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const Body = z.object({ variantId: z.string(), quantity: z.number().int().min(1).max(10).default(1) });

export async function POST(req: NextRequest) {
  if (!isStripeReady()) return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const variant = await prisma.productVariant.findUnique({
    where: { id: parsed.data.variantId },
    include: { product: { include: { translations: { where: { locale: 'fr' } } } } },
  });
  if (!variant || !variant.active || !variant.product.active) {
    return NextResponse.json({ error: 'variant_not_found_or_inactive' }, { status: 404 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const productTitle = variant.product.translations[0]?.title ?? variant.product.slug;

  const session = await stripe!.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      quantity: parsed.data.quantity,
      price_data: {
        currency: variant.currency.toLowerCase(),
        unit_amount: variant.priceCents,
        product_data: {
          name: `${productTitle} — ${variant.label}`,
          metadata: { variantId: variant.id, productId: variant.product.id },
        },
      },
    }],
    metadata: { variantId: variant.id, productId: variant.product.id, kind: 'TICKET' },
    success_url: `${base}/fr/billetterie/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/fr/billetterie?cancelled=1`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
