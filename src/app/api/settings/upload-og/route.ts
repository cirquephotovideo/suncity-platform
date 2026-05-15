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
  if (!ct.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'multipart only' }, { status: 415 });
  }
  const fd = await req.formData();
  const file = fd.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
  const key = `settings/og-${randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const stream = Readable.from(buf);

  await s3.putObject(bucket, key, stream, buf.byteLength, {
    'Content-Type': file.type || 'image/png',
    'Cache-Control': 'public, max-age=31536000',
  });

  return NextResponse.json({ ok: true, url: publicUrl(key) });
}
