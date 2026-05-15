export const dynamic = 'force-dynamic';

import Script from 'next/script';
import { localBusinessJsonLd } from '@/lib/jsonld';
import { SkinAwareChrome } from '@/components/SkinAwareChrome';
import type { ReactNode } from 'react';

export default async function ClassicLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <SkinAwareChrome locale={locale}>
        {children}
      </SkinAwareChrome>
      <Script id="ld-localbusiness" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(localBusinessJsonLd())}
      </Script>
    </>
  );
}
