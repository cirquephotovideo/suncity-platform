import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().toLowerCase(),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? null;
  const ua = req.headers.get('user-agent') ?? null;

  const msg = await prisma.contactMessage.create({
    data: { name: parsed.data.name, email: parsed.data.email, subject: parsed.data.subject ?? null, body: parsed.data.body, ip, userAgent: ua },
  });

  const adminEmail = process.env.ADMIN_EMAIL || 'arnaud@gredai.com';
  try {
    await sendMail({
      to: adminEmail,
      subject: `[Sun City] Contact — ${parsed.data.subject ?? 'Sans objet'}`,
      html: `<p><strong>${parsed.data.name}</strong> &lt;${parsed.data.email}&gt;</p><p>${parsed.data.body.replace(/\n/g, '<br>')}</p><p><em>IP: ${ip ?? '?'} · UA: ${ua ?? '?'}</em></p><p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/contact/${msg.id}">Ouvrir dans le BO</a></p>`,
    });
  } catch (e) { console.error('contact admin notif failed', e); }

  return NextResponse.json({ ok: true });
}
