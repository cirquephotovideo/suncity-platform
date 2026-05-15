import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false as const, status: 401, error: 'unauthorized' };
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN') return { ok: false as const, status: 403, error: 'forbidden' };
  return { ok: true as const, userId: (session.user as { id: string }).id };
}

function shapeRow(u: any) {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    role: u.role,
    image: u.image ?? null,
    createdAt: u.createdAt?.toISOString?.() ?? u.createdAt,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    suspendedAt: u.suspendedAt ? u.suspendedAt.toISOString() : null,
    has2fa: !!u.mfa,
  };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await ctx.params;
  const u = await prisma.user.findUnique({ where: { id }, include: { mfa: true } });
  if (!u) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const auditLogs = await prisma.auditLog.findMany({
    where: { OR: [{ targetId: id, targetType: 'User' }, { actorId: id }] },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { actor: { select: { email: true, name: true } } },
  });

  return NextResponse.json({
    ok: true,
    user: shapeRow(u),
    audit: auditLogs.map(l => ({
      id: l.id,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      diff: l.diffJson,
      ip: l.ip,
      actorEmail: l.actor?.email ?? null,
      isActor: l.actorId === id,
      createdAt: l.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const data: any = {};
  if ('role' in body) {
    if (body.role !== 'ADMIN' && body.role !== 'EDITOR') {
      return NextResponse.json({ error: 'invalid role' }, { status: 400 });
    }
    data.role = body.role;
  }
  if ('name' in body) data.name = String(body.name || '').trim() || null;
  if ('suspended' in body) {
    if (body.suspended === true) data.suspendedAt = new Date();
    else if (body.suspended === false) data.suspendedAt = null;
  }

  // Prevent self-suspension or self-demotion (last admin safeguard)
  if (id === a.userId && (data.role === 'EDITOR' || data.suspendedAt)) {
    return NextResponse.json({ error: 'cannot modify your own role/suspension' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id }, data, include: { mfa: true },
  });

  await audit({
    actorId: a.userId, action: 'UPDATE', targetType: 'User', targetId: id,
    diff: data,
  });

  return NextResponse.json({ ok: true, user: shapeRow(updated) });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });
  const { id } = await ctx.params;
  if (id === a.userId) {
    return NextResponse.json({ error: 'cannot delete yourself' }, { status: 400 });
  }
  const u = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!u) return NextResponse.json({ error: 'not found' }, { status: 404 });
  await prisma.user.delete({ where: { id } });
  await audit({
    actorId: a.userId, action: 'DELETE', targetType: 'User', targetId: id,
    diff: { email: u.email },
  });
  return NextResponse.json({ ok: true });
}
