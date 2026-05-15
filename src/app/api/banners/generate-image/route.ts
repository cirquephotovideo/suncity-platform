import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateImage, type ImageProvider } from '@/lib/ai-media';

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
    count?: number;
    provider?: ImageProvider;
  } | null;

  const prompt = body?.prompt?.trim();
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  const result = await generateImage({
    prompt,
    count: body?.count ?? 2,
    provider: body?.provider,
  });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error, provider: result.provider }, { status: 502 });

  return NextResponse.json({ ok: true, images: result.images, provider: result.provider });
}
