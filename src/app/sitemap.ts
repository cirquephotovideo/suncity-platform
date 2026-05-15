import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const now = new Date();
  const paths = ['', '/agenda', '/lieux', '/tarifs', '/horaires-acces', '/reglement', '/checkin', '/contact', '/newsletter', '/mentions-legales', '/rgpd'];
  const out: MetadataRoute.Sitemap = [];
  for (const p of paths) {
    out.push({ url: `${base}/fr${p}`, lastModified: now, changeFrequency: 'weekly', priority: p === '' ? 1.0 : 0.7 });
    out.push({ url: `${base}/en${p}`, lastModified: now, changeFrequency: 'weekly', priority: p === '' ? 0.9 : 0.6 });
  }
  return out;
}
