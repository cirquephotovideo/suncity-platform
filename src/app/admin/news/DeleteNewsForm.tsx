'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteNewsForm({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!confirm('Supprimer cette actualité ?')) return;
        setBusy(true);
        try {
          const r = await fetch(`/api/news/${id}`, { method: 'DELETE' });
          if (r.ok) router.refresh();
          else alert('Erreur suppression');
        } finally {
          setBusy(false);
        }
      }}
      className="text-danger hover:underline disabled:opacity-50"
    >
      Suppr.
    </button>
  );
}
