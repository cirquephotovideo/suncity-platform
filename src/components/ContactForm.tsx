'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('contact');
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd as any)),
      });
      if (!res.ok) throw new Error('failed');
      setState('success');
      e.currentTarget.reset();
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-success/10 border border-success/40 rounded-lg p-6 text-center">
        <h3 className="font-display text-xl text-success mb-2">{t('successTitle')}</h3>
        <p className="text-textMuted">{t('successBody')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1" htmlFor="name">{t('nameLabel')}</label>
        <input id="name" name="name" required className="w-full bg-bgAlt border border-border rounded-md px-3 py-2 focus:border-primary outline-none" />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="email">{t('emailLabel')}</label>
        <input id="email" name="email" type="email" required className="w-full bg-bgAlt border border-border rounded-md px-3 py-2 focus:border-primary outline-none" />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="subject">{t('subjectLabel')}</label>
        <input id="subject" name="subject" className="w-full bg-bgAlt border border-border rounded-md px-3 py-2 focus:border-primary outline-none" />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="body">{t('messageLabel')}</label>
        <textarea id="body" name="body" required rows={6} className="w-full bg-bgAlt border border-border rounded-md px-3 py-2 focus:border-primary outline-none resize-y"></textarea>
      </div>
      {state === 'error' && <p className="text-danger text-sm">{t('errorGeneric')}</p>}
      <button type="submit" disabled={state === 'sending'} className="btn-primary disabled:opacity-50">
        {t('submit')}
      </button>
    </form>
  );
}
