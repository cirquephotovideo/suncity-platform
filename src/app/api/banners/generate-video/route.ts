import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateVideo, type VideoProvider, type HfModel, type HfMotion } from '@/lib/ai-media';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as {
    prompt?: string;
    provider?: VideoProvider;
    higgsfield?: { model?: HfModel; duration?: number; motion?: HfMotion; loop?: boolean };
    aspectRatio?: '16:9' | '9:16';
    duration?: number;
  } | null;

  const prompt = body?.prompt?.trim();
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  const result = await generateVideo({
    prompt,
    provider: body?.provider,
    aspectRatio: body?.aspectRatio,
    duration: body?.duration ?? body?.higgsfield?.duration,
    model: body?.higgsfield?.model,
    motion: body?.higgsfield?.motion,
    loop: body?.higgsfield?.loop,
  });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error, provider: result.provider }, { status: 502 });

  return NextResponse.json({ ok: true, videoUrl: result.videoUrl, provider: result.provider });
}
