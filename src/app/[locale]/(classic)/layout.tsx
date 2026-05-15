export const dynamic = 'force-dynamic';

import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeGate from '@/components/AgeGate';
import AskSunCityWidget from '@/components/AskSunCityWidget';
import { localBusinessJsonLd } from '@/lib/jsonld';
import type { ReactNode } from 'react';

export default function ClassicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <AgeGate />
      <AskSunCityWidget />
      <Script id="ld-localbusiness" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(localBusinessJsonLd())}
      </Script>
    </>
  );
}
