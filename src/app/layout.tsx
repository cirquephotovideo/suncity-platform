import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import type { ReactNode } from 'react';

const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <head>
        <meta name="rating" content="adult" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
