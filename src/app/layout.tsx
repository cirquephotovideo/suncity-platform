import './globals.css';
import { Playfair_Display, Inter, Unbounded, Big_Shoulders_Display } from 'next/font/google';
import type { ReactNode } from 'react';

const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const unbounded = Unbounded({ subsets: ['latin'], variable: '--font-unbounded', display: 'swap', weight: ['200','300','400','500','700','900'] });
const bigShoulders = Big_Shoulders_Display({ subsets: ['latin'], variable: '--font-big-shoulders', display: 'swap', weight: ['100','400','700','900'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${unbounded.variable} ${bigShoulders.variable}`}>
      <head>
        <meta name="rating" content="adult" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
