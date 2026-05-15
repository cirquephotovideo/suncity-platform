'use client';
import { useRouter } from 'next/navigation';
import { NewsManager } from '@/components/admin/NewsManager';

export default function NewNewsPage() {
  const router = useRouter();
  return (
    <NewsManager
      onClose={() => router.push('/admin/news')}
      onSaved={n => router.push(n?.id ? `/admin/news/${n.id}/edit` : '/admin/news')}
    />
  );
}
