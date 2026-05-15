'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function AgeGate() {
  const t = useTranslations('ageGate');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const cookieOk = document.cookie.split('; ').some((c) => c.startsWith('sc_age_ok=1'));
    if (!cookieOk) setOpen(true);
  }, []);

  function confirm() {
    document.cookie = `sc_age_ok=1; max-age=${60 * 60 * 24 * 30}; path=/; samesite=lax`;
    setOpen(false);
  }
  function leave() {
    window.location.href = 'https://www.google.com/';
  }

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="agegate-title"
         className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-bgAlt border border-border rounded-lg p-6 md:p-8 text-center shadow-2xl">
        <p className="eyebrow mb-3">18+</p>
        <h2 id="agegate-title" className="text-2xl md:text-3xl mb-3">{t('title')}</h2>
        <p className="text-textMuted mb-6">{t('body')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={confirm} className="btn-primary">{t('confirm')}</button>
          <button onClick={leave} className="btn-ghost">{t('leave')}</button>
        </div>
      </div>
    </div>
  );
}
