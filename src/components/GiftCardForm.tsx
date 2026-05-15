'use client';
import { useState } from 'react';

const PRESET_AMOUNTS = [10, 25, 50, 100, 200];

export default function GiftCardForm({ locale, disabled }: { locale: string; disabled?: boolean }) {
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function buy(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const finalAmount = custom ? Math.round(Number(custom) * 100) : amount * 100;
    if (finalAmount < 1000 || finalAmount > 20000) {
      setErr(locale === 'fr' ? 'Montant entre 10€ et 200€' : 'Amount between €10 and €200');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/checkout/gift-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents: finalAmount, recipientEmail: recipientEmail || null, recipientName: recipientName || null, message: message || null }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { setErr(data.error ?? 'Erreur'); setLoading(false); }
    } catch {
      setErr('Erreur réseau'); setLoading(false);
    }
  }

  return (
    <form onSubmit={buy} className="bg-bgAlt border border-border rounded-xl p-6 space-y-5">
      <div>
        <label className="block text-sm mb-3">{locale === 'fr' ? 'Montant' : 'Amount'}</label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {PRESET_AMOUNTS.map(a => (
            <button key={a} type="button" onClick={() => { setAmount(a); setCustom(''); }}
                    className={`py-3 rounded-lg border transition ${amount === a && !custom ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/60'}`}>
              {a}€
            </button>
          ))}
        </div>
        <input type="number" min={10} max={200} step={5} placeholder={locale === 'fr' ? 'Autre (10–200€)' : 'Other (10–200€)'}
               value={custom} onChange={e => setCustom(e.target.value)}
               className="w-full bg-bg border border-border rounded px-3 py-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">{locale === 'fr' ? 'Email du destinataire (optionnel)' : 'Recipient email (optional)'}</label>
          <input type="email" placeholder="ex: ami@email.com" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                 className="w-full bg-bg border border-border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">{locale === 'fr' ? 'Nom destinataire (optionnel)' : 'Recipient name (optional)'}</label>
          <input type="text" placeholder="ex: Alex" value={recipientName} onChange={e => setRecipientName(e.target.value)}
                 className="w-full bg-bg border border-border rounded px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">{locale === 'fr' ? 'Message personnel (optionnel)' : 'Personal message (optional)'}</label>
        <textarea rows={3} maxLength={300} value={message} onChange={e => setMessage(e.target.value)}
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-sm" />
      </div>

      {err && <p className="text-danger text-sm">{err}</p>}

      <button type="submit" disabled={disabled || loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? '…' : locale === 'fr' ? `🎁 Acheter ${custom || amount}€` : `🎁 Buy ${custom || amount}€`}
      </button>
      <p className="text-xs text-textMuted text-center">{locale === 'fr' ? 'Paiement sécurisé Stripe' : 'Secure Stripe payment'}</p>
    </form>
  );
}
