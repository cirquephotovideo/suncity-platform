import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false as const, status: 401, error: 'unauthorized' };
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN') return { ok: false as const, status: 403, error: 'forbidden' };
  return { ok: true as const, userId: (session.user as { id: string }).id };
}

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await ctx.params;

  const tempPassword = randomBytes(12).toString('base64url');
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const u = await prisma.user.update({
    where: { id }, data: { passwordHash }, select: { email: true },
  });

  await audit({
    actorId: a.userId, action: 'UPDATE', targetType: 'User', targetId: id,
    diff: { reset_password: true, email: u.email },
  });

  return NextResponse.json({ ok: true, tempPassword });
}
