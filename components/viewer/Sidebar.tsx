'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';

type NavItem = {
  label: string;
  href?: string;
  experiment?: true;
  children?: NavItem[];
};

const NAV: NavItem[] = [
  {
    label: 'Foundations',
    children: [
      { label: 'Colors',      href: '/tokens/colors' },
      { label: 'Typography',  href: '/tokens/typography' },
      { label: 'Spacing',     href: '/tokens/spacing' },
      { label: 'Radius',      href: '/tokens/radius' },
      { label: 'Shadow',      href: '/tokens/shadow' },
      { label: 'Motion',      href: '/tokens/motion' },
    ],
  },
  {
    label: 'Typography',
    children: [
      { label: 'Specimens', href: '/typography' },
    ],
  },
  {
    label: 'Components',
    children: [
      { label: 'Button', href: '/components/button' },
      { label: 'Input',  href: '/components/input' },
      { label: 'Card',   href: '/components/card' },
      { label: 'Badge',          href: '/components/badge' },
      { label: 'Chat Input Box', href: '/components/chat-input-box' },
    ],
  },
  {
    label: 'Effects',
    children: [
      { label: 'Gravity Assist', href: '/effects/gravity-assist', experiment: true },
    ],
  },
  {
    label: 'Patterns',
    children: [
      { label: 'Overview', href: '/patterns' },
    ],
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = item.href ? pathname === item.href : false;

  if (!item.href) return null;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors',
        isActive
          ? 'bg-zinc-100 text-zinc-900 font-medium'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
      )}
    >
      <span>{item.label}</span>
      {item.experiment && <ExperimentBadge />}
    </Link>
  );
}

function NavSection({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        {item.label}
        <ChevronRight className={cn('h-3 w-3 transition-transform', open && 'rotate-90')} />
      </button>
      {open && item.children && (
        <div className="mt-1 space-y-0.5">
          {item.children.map(child => (
            <NavLink key={child.href} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4">
        <span className="text-sm font-semibold text-zinc-900 tracking-tight">Spaceship DS</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {NAV.map(section => (
          <NavSection key={section.label} item={section} />
        ))}
      </nav>
    </aside>
  );
}
