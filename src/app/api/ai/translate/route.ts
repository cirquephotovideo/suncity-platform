import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { translate } from '@/lib/ai-provider';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(session?.user as { role?: string } | undefined)?.role) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as { text?: string; from?: string; to?: string } | null;
  if (!body?.text) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  const from = body.from ?? 'fr';
  const to = body.to ?? 'en';
  const result = await translate(body.text, from, to);

  if (!result.ok) {
    return NextResponse.json({ error: result.error, text: result.text }, { status: 502 });
  }
  return NextResponse.json({ ok: true, text: result.text });
}
