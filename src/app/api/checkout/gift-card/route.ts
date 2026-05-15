import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe, isStripeReady } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const Body = z.object({
  amountCents: z.number().int().min(1000).max(20000),
  recipientEmail: z.string().email().nullable().optional(),
  recipientName: z.string().max(80).nullable().optional(),
  message: z.string().max(300).nullable().optional(),
});

export async function POST(req: NextRequest) {
  if (!isStripeReady()) return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const { amountCents, recipientEmail, recipientName, message } = parsed.data;
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const session = await stripe!.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: amountCents,
        product_data: {
          name: `Carte cadeau Sun City Paris — ${(amountCents / 100).toFixed(2)} €`,
        },
      },
    }],
    metadata: {
      kind: 'GIFT_CARD',
      recipientEmail: recipientEmail ?? '',
      recipientName: recipientName ?? '',
      message: message ?? '',
    },
    success_url: `${base}/fr/cartes-cadeau/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/fr/cartes-cadeau?cancelled=1`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
