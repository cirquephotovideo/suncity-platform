import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { s3, bucket, publicUrl } from '@/lib/storage';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const ct = req.headers.get('content-type') ?? '';

  // ── multipart file upload ──────────────────────────────────────────────────
  if (ct.includes('multipart/form-data')) {
    const fd = await req.formData();
    const file = fd.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const key = `banners/${randomUUID()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buf);

    await s3.putObject(bucket, key, stream, buf.byteLength, {
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=31536000',
    });

    return NextResponse.json({ ok: true, url: publicUrl(key) });
  }

  // ── base64 JSON upload (from AI-generated image) ───────────────────────────
  if (ct.includes('application/json')) {
    const body = await req.json().catch(() => null) as {
      base64?: string;
      mimeType?: string;
      name?: string;
    } | null;
    if (!body?.base64) return NextResponse.json({ error: 'no base64' }, { status: 400 });

    const mime = body.mimeType ?? 'image/jpeg';
    const ext = mime.split('/')[1] ?? 'jpg';
    const key = `banners/ai-${body.name ?? 'img'}-${randomUUID()}.${ext}`;
    const buf = Buffer.from(body.base64, 'base64');
    const stream = Readable.from(buf);

    await s3.putObject(bucket, key, stream, buf.byteLength, {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000',
    });

    return NextResponse.json({ ok: true, url: publicUrl(key) });
  }

  return NextResponse.json({ error: 'unsupported content-type' }, { status: 415 });
}
