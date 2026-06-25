import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Ai Studio Referrals — Referral Marketing Made Effortless',
  description:
    'Launch a configurable, double-sided referral program for any business in minutes. Codes, links, QR, fraud protection, payouts, and a premium dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-bg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
