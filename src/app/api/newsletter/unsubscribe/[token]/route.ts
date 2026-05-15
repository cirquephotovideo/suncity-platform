import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sub = await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } });
  if (!sub) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  await prisma.newsletterSubscriber.update({ where: { id: sub.id }, data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() } });
  return NextResponse.redirect(new URL('/newsletter?unsubscribed=1', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
