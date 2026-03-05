'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
    label: 'Assets',
    children: [
      { label: 'Logo',          href: '/assets/logo' },
      { label: 'Icons',         href: '/assets/icons' },
      { label: 'Illustrations', href: '/assets/illustrations' },
      { label: 'Animations',    href: '/assets/animations' },
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
      { label: 'Chat Bubble',   href: '/components/chat-bubble' },
      { label: 'Chat Message',  href: '/components/chat-message' },
      { label: 'Chat Thread',   href: '/components/chat-thread' },
    ],
  },
  {
    label: 'Effects',
    children: [
      { label: 'Gravity Assist',    href: '/effects/gravity-assist',    experiment: true },
      { label: 'Grid Background',   href: '/effects/grid-background',   experiment: true },
    ],
  },
  {
    label: 'Patterns',
    children: [
      { label: 'Overview',              href: '/patterns' },
      { label: 'Chat',                  href: '/patterns/chat' },
      { label: 'Preview Panel',         href: '/patterns/preview-panel' },
      { label: 'Preview Panel Header',  href: '/patterns/preview-panel-header' },
      { label: 'Editable Title',        href: '/patterns/editable-title' },
      { label: 'Shareable Link',        href: '/patterns/shareable-link' },
      { label: 'Sidebar Toggle',        href: '/patterns/sidebar-toggle' },
    ],
  },
  {
    label: 'Pages',
    children: [
      { label: 'Gravity Chat',        href: '/patterns/gravity-chat',        experiment: true },
      { label: 'Prototype Workspace', href: '/patterns/prototype-workspace', experiment: true },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

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

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-screen flex-shrink-0 flex-col border-r border-zinc-200 bg-white transition-[width] duration-200 ease-in-out overflow-hidden',
        collapsed ? 'w-12' : 'w-60'
      )}
    >
      <div className="flex h-14 flex-shrink-0 items-center border-b border-zinc-200 px-3">
        {collapsed ? (
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        ) : (
          <>
            <span className="flex-1 text-sm font-semibold text-zinc-900 tracking-tight">Design System</span>
            <button
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {!collapsed && (
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {NAV.map(section => (
            <NavSection key={section.label} item={section} />
          ))}
        </nav>
      )}
    </aside>
  );
}
