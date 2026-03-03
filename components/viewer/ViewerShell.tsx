'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/viewer/Sidebar';

const STORAGE_KEY = 'ds-sidebar-collapsed';

export function ViewerShell({ children }: { children: React.ReactNode }) {
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
    <>
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </>
  );
}
