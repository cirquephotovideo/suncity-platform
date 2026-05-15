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

export async function GET(req: NextRequest) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const role = searchParams.get('role') || '';
  const status = searchParams.get('status') || '';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 50)));

  const where: any = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (role === 'ADMIN' || role === 'EDITOR') where.role = role;
  if (status === 'suspended') where.suspendedAt = { not: null };
  if (status === 'active') where.suspendedAt = null;

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { mfa: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    total,
    page,
    limit,
    users: items.map(shapeRow),
  });
}

export async function POST(req: NextRequest) {
  const a = await ensureAdmin();
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.status });

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim() || null;
  const role = body.role === 'ADMIN' ? 'ADMIN' : 'EDITOR';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'email invalide' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ ok: false, error: 'email déjà utilisé' }, { status: 409 });

  const tempPassword = randomBytes(12).toString('base64url');
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const created = await prisma.user.create({
    data: { email, name, role, passwordHash },
    include: { mfa: true },
  });

  await audit({
    actorId: a.userId, action: 'CREATE', targetType: 'User', targetId: created.id,
    diff: { email, role },
  });

  return NextResponse.json({
    ok: true,
    user: shapeRow(created),
    tempPassword,
  });
}
