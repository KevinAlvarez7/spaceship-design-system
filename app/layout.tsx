import type { Metadata } from 'next';
import './globals.css';
import { Zilla_Slab, Outfit } from 'next/font/google';
import { Sidebar } from '@/components/viewer/Sidebar';

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

export const metadata: Metadata = {
  title: 'Spaceship Design System',
  description: 'Living style guide and component explorer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${zillaSlab.variable} ${outfit.variable} flex h-screen overflow-hidden bg-white`}>
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
