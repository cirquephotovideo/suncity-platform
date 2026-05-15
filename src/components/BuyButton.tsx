'use client';
import { useState } from 'react';

export default function BuyButton({ variantId, label, disabled }: { variantId: string; label: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  async function buy() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? 'Erreur paiement');
        setLoading(false);
      }
    } catch (e) {
      alert('Erreur réseau');
      setLoading(false);
    }
  }
  return (
    <button disabled={disabled || loading} onClick={buy} className="btn-primary text-sm disabled:opacity-50">
      {loading ? '…' : label}
    </button>
  );
}
