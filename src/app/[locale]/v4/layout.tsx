export const dynamic = 'force-dynamic';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import AgeGate from '@/components/AgeGate';
import type { ReactNode } from 'react';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function V4Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {/* Fraunces + JetBrains Mono — chargées inline pour isoler du layout global */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&family=JetBrains+Mono:wght@400;700&display=swap"
      />
      {/* Pas de Header/Footer Sun City classique — skin standalone */}
      <div
        style={{
          minHeight: '100vh',
          background: '#FFF6E0',
          color: '#0F1422',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {children}
        <AgeGate />
      </div>
    </NextIntlClientProvider>
  );
}
