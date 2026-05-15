import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';

const Body = z.object({
  email: z.string().email().toLowerCase(),
  locale: z.enum(['fr', 'en']).default('fr'),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const { email, locale } = parsed.data;
  const confirmToken = crypto.randomBytes(24).toString('hex');
  const unsubscribeToken = crypto.randomBytes(24).toString('hex');

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing && existing.status === 'CONFIRMED') {
    return NextResponse.json({ ok: true, alreadyConfirmed: true });
  }

  const sub = await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { status: 'PENDING', confirmToken, unsubscribeToken, locale },
    create: { email, locale, status: 'PENDING', confirmToken, unsubscribeToken },
  });

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const link = `${base}/${locale}/api/newsletter/confirm/${sub.confirmToken}`;
  const subject = locale === 'fr' ? 'Confirmez votre inscription — Sun City Paris' : 'Confirm your signup — Sun City Paris';
  const html = locale === 'fr'
    ? `<p>Bonjour,</p><p>Cliquez sur le lien suivant pour confirmer votre inscription à la newsletter Sun City Paris :</p><p><a href="${link}">${link}</a></p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`
    : `<p>Hi,</p><p>Click the link below to confirm your signup to the Sun City Paris newsletter:</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, ignore this email.</p>`;

  try { await sendMail({ to: email, subject, html }); } catch (e) { console.error('newsletter mail failed', e); }

  return NextResponse.json({ ok: true });
}
