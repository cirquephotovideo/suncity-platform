'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewsManager, type NewsRich } from '@/components/admin/NewsManager';
import { Loader2 } from 'lucide-react';

export default function NewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [news, setNews] = useState<NewsRich | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then(r => r.json())
      .then(j => { if (j.news) setNews(j.news); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-textMuted" size={32} />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center py-20 text-textMuted">
        Actualité introuvable.{' '}
        <button onClick={() => router.back()} className="text-primary underline">Retour</button>
      </div>
    );
  }

  return (
    <NewsManager
      news={news}
      onClose={() => router.push('/admin/news')}
      onSaved={() => router.push('/admin/news')}
    />
  );
}
