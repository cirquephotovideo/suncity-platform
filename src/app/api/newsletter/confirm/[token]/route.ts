import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sub = await prisma.newsletterSubscriber.findUnique({ where: { confirmToken: token } });
  if (!sub) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (sub.status === 'CONFIRMED') return NextResponse.redirect(new URL('/newsletter?confirmed=already', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  await prisma.newsletterSubscriber.update({ where: { id: sub.id }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
  return NextResponse.redirect(new URL('/newsletter?confirmed=1', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
