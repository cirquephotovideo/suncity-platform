import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { stripe, isStripeReady } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!isStripeReady() || !webhookSecret) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature') ?? '';
  const body = await req.text();

  let event;
  try {
    event = stripe!.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e: any) {
    return NextResponse.json({ error: 'invalid_signature', detail: e.message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session: any = event.data.object;
    const meta = session.metadata ?? {};
    if (meta.kind === 'TICKET') await handleTicketPaid(session);
    if (meta.kind === 'GIFT_CARD') await handleGiftCardPaid(session);
  }

  return NextResponse.json({ received: true });
}

async function handleTicketPaid(session: any) {
  const variantId = session.metadata?.variantId as string | undefined;
  if (!variantId) return;
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { include: { translations: { where: { locale: 'fr' } } } } },
  });
  if (!variant) return;

  // Idempotence : ne pas recréer si déjà fait
  const existing = await prisma.order.findUnique({ where: { stripeCheckoutId: session.id } });
  if (existing) return;

  const number = `SC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1e9).toString().padStart(9, '0')}`;
  const qrToken = crypto.randomBytes(16).toString('hex');

  const order = await prisma.order.create({
    data: {
      number,
      email: session.customer_details?.email ?? session.customer_email ?? 'unknown@example.com',
      customerName: session.customer_details?.name ?? null,
      status: 'PAID',
      totalCents: session.amount_total ?? variant.priceCents,
      currency: (session.currency ?? variant.currency).toUpperCase(),
      stripeCheckoutId: session.id,
      stripePaymentIntentId: session.payment_intent ?? null,
      paidAt: new Date(),
      items: {
        create: [{
          productId: variant.product.id,
          variantId: variant.id,
          quantity: 1,
          unitPriceCents: variant.priceCents,
          totalCents: session.amount_total ?? variant.priceCents,
          qrCodeToken: qrToken,
        }],
      },
    },
    include: { items: true },
  });

  // QR code : URL vers /ticket/[token]
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://sun.pixeeplay.com';
  const ticketUrl = `${base}/fr/ticket/${qrToken}`;
  const qrDataUrl = await QRCode.toDataURL(ticketUrl, { width: 320, margin: 1, color: { dark: '#0E1626', light: '#F2E8D5' } });

  const productTitle = variant.product.translations[0]?.title ?? variant.product.slug;
  const html = `
<div style="font-family:Inter,system-ui,sans-serif; max-width:540px; margin:0 auto; padding:24px; background:#0E1626; color:#F2E8D5">
  <h1 style="font-family:'Playfair Display',serif; color:#C9A24B; margin:0 0 8px">Sun City Paris</h1>
  <p style="color:#B8B19E; margin:0 0 24px">Ton entrée est confirmée 🔥</p>

  <div style="background:#1A2438; border:1px solid #3A4358; border-radius:12px; padding:24px; text-align:center">
    <p style="margin:0 0 4px; font-size:12px; color:#B8B19E; text-transform:uppercase; letter-spacing:0.2em">Commande</p>
    <p style="margin:0 0 18px; font-family:monospace; color:#C9A24B">${order.number}</p>
    <p style="margin:0 0 4px; font-size:14px">${productTitle} — ${variant.label}</p>
    <p style="margin:0 0 24px; color:#C9A24B; font-size:18px; font-weight:600">${(order.totalCents / 100).toFixed(2)} €</p>
    <img src="${qrDataUrl}" width="280" alt="QR code" style="display:block; margin:0 auto; border:8px solid #F2E8D5; border-radius:12px" />
    <p style="margin:18px 0 0; font-size:12px; color:#B8B19E">Présente ce QR à l'accueil pour valider ton entrée</p>
  </div>

  <div style="margin-top:24px; padding:16px; background:#1A2438; border:1px solid #3A4358; border-radius:8px; font-size:13px">
    <p style="margin:0 0 8px; font-weight:600; color:#C9A24B">📍 Sun City Paris</p>
    <p style="margin:0 0 4px">62 boulevard de Sébastopol, 75003 Paris</p>
    <p style="margin:0 0 4px">01 40 09 26 09</p>
    <p style="margin:0; color:#B8B19E">Ouvert 7/7 12h-2h (6h ven/sam)</p>
  </div>

  <p style="margin-top:24px; font-size:11px; color:#8C8576; text-align:center">
    Site adulte 18+ · Hommes uniquement · SARL GYM SEBASTOPOL — RCS 45274626600025
  </p>
</div>
`;

  try {
    await sendMail({
      to: order.email,
      subject: `🎟️ Ton entrée Sun City Paris — ${order.number}`,
      html,
    });
  } catch (e) { console.error('mail send failed', e); }

  // Notif admin
  const adminEmail = process.env.ADMIN_EMAIL || 'arnaud@gredai.com';
  try {
    await sendMail({
      to: adminEmail,
      subject: `[Sun City] 💰 Nouvelle commande payée — ${order.number}`,
      html: `<p>Nouvelle commande <strong>${order.number}</strong> de <strong>${order.email}</strong></p><p>${productTitle} — ${variant.label} : <strong>${(order.totalCents / 100).toFixed(2)} €</strong></p><p>Voir la commande : ${base}/admin/orders</p>`,
    });
  } catch (e) { console.error('admin notif failed', e); }
}

async function handleGiftCardPaid(session: any) {
  const amountCents = session.amount_total as number;
  const buyerEmail = session.customer_details?.email ?? session.customer_email ?? 'unknown@example.com';
  const recipientEmail = session.metadata?.recipientEmail as string | undefined;
  const recipientName = session.metadata?.recipientName as string | undefined;
  const buyerName = session.customer_details?.name as string | undefined;
  const message = session.metadata?.message as string | undefined;

  // Idempotence
  const existing = await prisma.giftCard.findUnique({ where: { stripeSessionId: session.id } });
  if (existing) return;

  const code = `SC-GIFT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const card = await prisma.giftCard.create({
    data: {
      code,
      amountCents,
      currency: (session.currency ?? 'eur').toUpperCase(),
      buyerEmail,
      buyerName,
      recipientEmail,
      recipientName,
      message,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      stripeSessionId: session.id,
    },
  });

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://sun.pixeeplay.com';
  const cardHtml = (recipient: string | null) => `
<div style="font-family:Inter,sans-serif; max-width:540px; margin:0 auto; padding:24px; background:#0E1626; color:#F2E8D5">
  <h1 style="font-family:'Playfair Display',serif; color:#C9A24B; margin:0 0 8px">🎁 Carte cadeau Sun City Paris</h1>
  ${recipient ? `<p style="color:#B8B19E">Bonjour ${recipient},</p><p style="color:#B8B19E">${buyerName ?? 'Quelqu\'un'} t'offre une carte cadeau Sun City :</p>` : `<p style="color:#B8B19E">Voici la carte cadeau que tu viens d'offrir :</p>`}

  <div style="background:linear-gradient(135deg,#C9A24B,#B66B3A); padding:32px; border-radius:16px; text-align:center; color:#0E1626; margin:24px 0">
    <p style="margin:0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.3em">Bon cadeau</p>
    <p style="margin:0; font-family:'Playfair Display',serif; font-size:42px; font-weight:600">${(amountCents / 100).toFixed(2)} €</p>
    <p style="margin:16px 0 0; font-family:monospace; font-size:18px; background:rgba(0,0,0,0.2); padding:8px 16px; border-radius:8px; display:inline-block">${code}</p>
    <p style="margin:8px 0 0; font-size:11px">Valable jusqu'au ${card.expiresAt!.toLocaleDateString('fr-FR')}</p>
  </div>

  ${message ? `<blockquote style="border-left:3px solid #C9A24B; padding-left:16px; color:#B8B19E; font-style:italic; margin:24px 0">${message}</blockquote>` : ''}

  <p style="font-size:13px; color:#B8B19E">Pour utiliser : présente le code à l'accueil ou applique-le lors d'un achat sur <a href="${base}/fr/billetterie" style="color:#C9A24B">${base}/fr/billetterie</a></p>

  <p style="margin-top:24px; font-size:11px; color:#8C8576; text-align:center">
    Sun City Paris · 62 bd de Sébastopol 75003 · 01 40 09 26 09 · 18+ · Hommes uniquement
  </p>
</div>
`;

  // Email au destinataire si fourni, sinon au buyer
  try {
    if (recipientEmail && recipientEmail !== buyerEmail) {
      await sendMail({ to: recipientEmail, subject: `🎁 ${buyerName ?? 'Quelqu\'un'} t'offre une carte cadeau Sun City Paris`, html: cardHtml(recipientName ?? null) });
    }
    await sendMail({ to: buyerEmail, subject: `🎁 Ta carte cadeau Sun City Paris — ${code}`, html: cardHtml(null) });
  } catch (e) { console.error('gift mail failed', e); }
}
