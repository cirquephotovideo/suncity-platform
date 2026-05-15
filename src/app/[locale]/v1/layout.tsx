export const dynamic = 'force-dynamic';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import AgeGate from '@/components/AgeGate';
import { v1RootStyle } from '@/components/v1/V1Atoms';
import type { ReactNode } from 'react';

export default async function V1Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div style={v1RootStyle}>
        {children}
        <AgeGate />
      </div>
    </NextIntlClientProvider>
  );
}
