'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BannerEditor, type BannerRich } from '@/components/admin/BannerEditor';
import { Loader2 } from 'lucide-react';

export default function BannerEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [banner, setBanner] = useState<BannerRich | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/banners/${params.id}`)
      .then(r => r.json())
      .then(j => { if (j.banner) setBanner(j.banner); })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-textMuted" size={32} />
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="text-center py-20 text-textMuted">
        Bannière introuvable.{' '}
        <button onClick={() => router.back()} className="text-primary underline">Retour</button>
      </div>
    );
  }

  return (
    <BannerEditor
      banner={banner}
      onClose={() => router.push('/admin/banners')}
      onSaved={() => router.push('/admin/banners')}
    />
  );
}
