'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/viewer/Sidebar';
import { TooltipProvider } from '@/components/shadcn/tooltip';
import type { NavItem } from '@spaceship/design-system/registry';

const STORAGE_KEY = 'ds-sidebar-collapsed';

export function ViewerShell({ nav, children }: { nav: NavItem[]; children: React.ReactNode }) {
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

  return (
    <TooltipProvider delayDuration={500}>
      <Sidebar nav={nav} collapsed={collapsed} onToggle={toggle} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </TooltipProvider>
  );
}
