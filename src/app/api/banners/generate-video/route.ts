import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateHfVideo, type HfModel, type HfMotion } from '@/lib/higgsfield';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as {
    prompt?: string;
    preset?: string;
    higgsfield?: { model?: HfModel; duration?: number; motion?: HfMotion; loop?: boolean };
  } | null;

  const prompt = body?.prompt?.trim();
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  const hf = body?.higgsfield ?? {};
  const result = await generateHfVideo({
    prompt,
    model: hf.model ?? 'higgsfield-lite',
    duration: hf.duration ?? 5,
    motion: hf.motion ?? 'medium',
    loop: hf.loop ?? true,
  });

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 502 });

  return NextResponse.json({ ok: true, videoUrl: result.videoUrl });
}
