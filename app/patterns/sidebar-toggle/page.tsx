'use client';

import { useState } from 'react';
import { SidebarToggle } from '@/components/patterns';

export default function SidebarTogglePage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col gap-(--spacing-sm) p-(--spacing-sm)">
      <div className="flex items-center gap-(--spacing-sm)">
        <SidebarToggle isOpen={isOpen} onToggle={() => setIsOpen(o => !o)} />
        <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-secondary)">
          Sidebar is {isOpen ? 'open' : 'closed'}
        </span>
      </div>
    </div>
  );
}
