import { NextRequest, NextResponse } from 'next/server';
import { s3, bucket } from '@/lib/storage';
import { Readable } from 'stream';

/**
 * Streame les fichiers MinIO via Next.js puisque MinIO n'est pas exposé
 * publiquement par Traefik. URL : /api/media/banners/abc.jpg
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const key = (path || []).join('/');
  if (!key) return NextResponse.json({ error: 'no key' }, { status: 400 });

  try {
    const stat = await s3.statObject(bucket, key);
    const stream = await s3.getObject(bucket, key);

    // Convert Node Readable → Web ReadableStream
    const webStream = Readable.toWeb(stream as Readable) as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': stat.metaData?.['content-type'] ?? 'application/octet-stream',
        'Content-Length': String(stat.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'not found', detail: String(e) }, { status: 404 });
  }
}
