'use client';
import { useRouter } from 'next/navigation';
import { BannerEditor } from '@/components/admin/BannerEditor';

export default function NewBannerPage() {
  const router = useRouter();
  return (
    <BannerEditor
      onClose={() => router.push('/admin/banners')}
      onSaved={(b) => router.push(`/admin/banners/${b.id}/edit`)}
    />
  );
}
