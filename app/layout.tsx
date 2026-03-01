import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/viewer/Sidebar';

export const metadata: Metadata = {
  title: 'Spaceship Design System',
  description: 'Living style guide and component explorer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-white">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
