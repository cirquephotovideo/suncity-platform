import type { ReactNode } from 'react';
import { prisma } from '@/lib/prisma';
import { getSkin, type SkinKey } from '@/lib/skins';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeGate from '@/components/AgeGate';
import AskSunCityWidget from '@/components/AskSunCityWidget';

import { V1Nav } from '@/components/v1/V1Nav';
import { V1Footer } from '@/components/v1/V1Footer';
import V2Nav from '@/components/v2/V2Nav';
import V2Footer from '@/components/v2/V2Footer';
import { V3Nav } from '@/components/v3/V3Nav';
import { V3Footer } from '@/components/v3/V3Footer';
import V4Nav from '@/components/v4/V4Nav';
import V4Footer from '@/components/v4/V4Footer';

async function getActiveContext() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  return { settings, skin: getSkin(settings?.themeKey) };
}

export async function SkinAwareChrome({ children, locale }: { children: ReactNode; locale: string }) {
  const { settings, skin } = await getActiveContext();
  const key = skin.key as SkinKey;

  // Sun classic
  if (key === 'sun') {
    return (
      <>
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        {/* @ts-expect-error async server */}
        <Footer />
        <AgeGate />
        <AskSunCityWidget />
      </>
    );
  }

  // V1 Acid
  if (key === 'v1-acid') {
    return (
      <div style={{ minHeight: '100vh', background: skin.bg, color: skin.fg }}>
        <V1Nav />
        <main>{children}</main>
        {/* @ts-expect-error async server */}
        <V1Footer />
        <AgeGate />
      </div>
    );
  }

  // V2 Techno
  if (key === 'v2-techno') {
    return (
      <div style={{ minHeight: '100vh', background: skin.bg, color: skin.fg, fontFamily: "'JetBrains Mono', 'Space Mono', monospace" }}>
        <V2Nav locale={locale} />
        <main>{children}</main>
        <V2Footer settings={settings as any} />
        <AgeGate />
      </div>
    );
  }

  // V3 Y2K Chrome Cruise
  if (key === 'v3-y2k') {
    return (
      <div style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 20% 0%, #FF006E33 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, #00F0FF33 0%, transparent 50%), #0A0A0A`,
        color: '#FFFFFF',
        fontFamily: 'var(--font-unbounded), sans-serif',
      }}>
        <V3Nav />
        <main>{children}</main>
        {/* @ts-expect-error async server */}
        <V3Footer />
        <AgeGate />
      </div>
    );
  }

  // V4 Moon
  if (key === 'v4-moon') {
    return (
      <div style={{ minHeight: '100vh', background: skin.bg, color: skin.fg }}>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&family=JetBrains+Mono:wght@400;700&display=swap" />
        <V4Nav locale={locale} />
        <main>{children}</main>
        <V4Footer locale={locale} settings={settings as any} />
        <AgeGate />
      </div>
    );
  }

  return <>{children}</>;
}
