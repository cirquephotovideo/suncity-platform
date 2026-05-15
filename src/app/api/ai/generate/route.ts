import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateText, generateImage } from '@/lib/ai-provider';

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

  const body = await req.json().catch(() => null) as { prompt?: string; kind?: string } | null;
  if (!body?.prompt) {
    return NextResponse.json({ error: 'prompt required' }, { status: 400 });
  }

  const kind = body.kind === 'image' ? 'image' : 'text';
  const result = kind === 'image'
    ? await generateImage(body.prompt)
    : await generateText(body.prompt);

  if (!result.ok) {
    return NextResponse.json({ error: result.error, text: result.text }, { status: 502 });
  }
  return NextResponse.json({ ok: true, text: result.text });
}
