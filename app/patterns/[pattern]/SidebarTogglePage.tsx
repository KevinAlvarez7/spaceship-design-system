'use client';

import { useState } from 'react';
import { Preview } from '@/components/viewer/Preview';
import { SidebarToggle } from '@/components/patterns';

export function SidebarTogglePage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Sidebar Toggle</h1>
        <p className="mt-2 text-sm text-zinc-500">Animated toggle button for expanding and collapsing a sidebar.</p>
      </div>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Interactive</h2>
        <Preview label="Interactive">
          <SidebarToggle isOpen={isOpen} onToggle={() => setIsOpen(o => !o)} />
          <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-secondary)">
            Sidebar is {isOpen ? 'open' : 'closed'}
          </span>
        </Preview>
      </section>
    </div>
  );
}
