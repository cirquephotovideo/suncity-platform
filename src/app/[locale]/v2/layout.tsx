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

export default async function V2Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div
        style={{
          minHeight: '100vh',
          background: '#000000',
          color: '#00FF41',
          fontFamily: "'JetBrains Mono', 'Space Mono', 'Courier New', monospace",
          overflowX: 'hidden',
        }}
      >
        {children}
        <AgeGate />
      </div>
    </NextIntlClientProvider>
  );
}
