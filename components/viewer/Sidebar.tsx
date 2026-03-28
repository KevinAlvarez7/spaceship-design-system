'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';
import { PlaygroundBadge } from '@/components/viewer/PlaygroundBadge';
import type { NavItem } from '@/lib/viewer-registry';
import { ScrollArea } from '@/components/shadcn/scroll-area';
import { Separator } from '@/components/shadcn/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/shadcn/collapsible';

interface SidebarProps {
  nav: NavItem[];
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
      {item.playground && <PlaygroundBadge />}
      {!item.playground && item.experiment && <ExperimentBadge />}
    </Link>
  );
}

function NavSection({ item }: { item: NavItem }) {
  const displayLabel = item.label;

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'group flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
            item.playground
              ? 'text-violet-400 hover:text-violet-600'
              : 'text-zinc-400 hover:text-zinc-600'
          )}
        >
          {displayLabel}
          <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
        </button>
      </CollapsibleTrigger>
      {item.children && (
        <CollapsibleContent>
          <div className="mt-1 space-y-0.5">
            {item.children.map(child => (
              <NavLink key={child.href} item={child} />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

function GroupDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-1 pt-1 pb-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">
        {label}
      </span>
      <Separator className="flex-1 bg-zinc-100" />
    </div>
  );
}

export function Sidebar({ nav, collapsed = false, onToggle }: SidebarProps) {
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
            <span className="flex-1 text-sm font-semibold text-zinc-900 tracking-tight">Spaceship DS</span>
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
        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-4">
            {nav.map((section, i) => {
              const prevSection = nav[i - 1];
              const isFirstConfirmed = section.label === 'Components';
              const isFirstPlayground = section.playground && !prevSection?.playground;

              return (
                <div key={section.label}>
                  {isFirstConfirmed && <GroupDivider label="Confirmed" />}
                  {isFirstPlayground && <GroupDivider label="Playground" />}
                  <NavSection item={section} />
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      )}
    </aside>
  );
}
