import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      version: process.env.npm_package_version ?? '0.1.0',
      buildId: process.env.NEXT_BUILD_ID ?? null,
      ts: new Date().toISOString(),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ status: 'degraded', error: 'db unreachable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
