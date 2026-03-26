import type { Metadata } from 'next';
import './globals.css';
import { Zilla_Slab, Outfit, JetBrains_Mono } from 'next/font/google';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { buildNav } from '@/lib/viewer-registry';
import { discoverComponentEntries } from '@/lib/discover-components';

const zillaSlab = Zilla_Slab({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-family-primary',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '400', '600', '700'],
  variable: '--font-family-secondary',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-family-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Spaceship Design System',
  description: 'Living style guide and component explorer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = buildNav(discoverComponentEntries());
  return (
    <html lang="en" className={`${zillaSlab.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="flex h-screen overflow-hidden bg-white">
        <ViewerShell nav={nav}>{children}</ViewerShell>
      </body>
    </html>
  );
}
