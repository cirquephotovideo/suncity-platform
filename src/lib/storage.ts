import * as Minio from 'minio';

const url = new URL(process.env.S3_ENDPOINT || 'http://minio:9000');

export const s3 = new Minio.Client({
  endPoint: url.hostname,
  port: Number(url.port) || (url.protocol === 'https:' ? 443 : 80),
  useSSL: url.protocol === 'https:',
  accessKey: process.env.S3_ACCESS_KEY || 'suncityminio',
  secretKey: process.env.S3_SECRET_KEY || 'suncityminio-secret',
});

export const bucket = process.env.S3_BUCKET || 'suncity';
export const publicBase = process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000';

export function publicUrl(key: string) {
  return `${publicBase}/${bucket}/${key.replace(/^\//, '')}`;
}
