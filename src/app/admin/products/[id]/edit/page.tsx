'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductsAdmin, type ProductRich } from '@/components/admin/ProductsAdmin';
import { Loader2 } from 'lucide-react';

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<ProductRich | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(j => { if (j.product) setProduct(j.product); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-textMuted" size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-textMuted">
        Produit introuvable.{' '}
        <button onClick={() => router.back()} className="text-primary underline">Retour</button>
      </div>
    );
  }

  return (
    <ProductsAdmin
      product={product}
      onClose={() => router.push('/admin/products')}
      onSaved={() => router.push('/admin/products')}
    />
  );
}
