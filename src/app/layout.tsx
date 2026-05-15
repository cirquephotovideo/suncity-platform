import './globals.css';
import { Playfair_Display, Inter, Unbounded, Big_Shoulders_Display } from 'next/font/google';
import type { ReactNode } from 'react';
import { prisma } from '@/lib/prisma';
import { getSkin } from '@/lib/skins';

export const dynamic = 'force-dynamic';

const display = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const unbounded = Unbounded({ subsets: ['latin'], variable: '--font-unbounded', display: 'swap', weight: ['200','300','400','500','700','900'] });
const bigShoulders = Big_Shoulders_Display({ subsets: ['latin'], variable: '--font-big-shoulders', display: 'swap', weight: ['100','400','700','900'] });

async function getActiveSkin() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  return getSkin(settings?.themeKey);
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const skin = await getActiveSkin();
  return (
    <html lang="fr" data-skin={skin.key} className={`${display.variable} ${body.variable} ${unbounded.variable} ${bigShoulders.variable}`}>
      <head>
        <meta name="rating" content="adult" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
