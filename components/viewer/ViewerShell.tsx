'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/viewer/Sidebar';
import { TooltipProvider } from '@/components/shadcn/tooltip';
import type { NavItem } from '@/lib/viewer-registry';

const STORAGE_KEY = 'ds-sidebar-collapsed';

export function ViewerShell({ nav, children }: { nav: NavItem[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = pathname.startsWith('/playground/');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setCollapsed(stored === 'true');
  }, []);

  function toggle() {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={500}>
      <Sidebar nav={nav} collapsed={collapsed} onToggle={toggle} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </TooltipProvider>
  );
}
