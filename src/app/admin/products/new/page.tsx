'use client';
import { useRouter } from 'next/navigation';
import { ProductsAdmin } from '@/components/admin/ProductsAdmin';

export default function NewProductPage() {
  const router = useRouter();
  return (
    <ProductsAdmin
      onClose={() => router.push('/admin/products')}
      onSaved={p => router.push(p?.id ? `/admin/products/${p.id}/edit` : '/admin/products')}
    />
  );
}
