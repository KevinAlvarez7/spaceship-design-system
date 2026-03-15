'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VersionSwitcher } from '@/components/viewer/VersionSwitcher';

type Surface = 'white' | 'subtle' | 'dark';

const surfaces: Record<Surface, { label: string; className: string }> = {
  white:  { label: 'White',  className: 'bg-white' },
  subtle: { label: 'Subtle', className: 'bg-zinc-50' },
  dark:   { label: 'Dark',   className: 'bg-zinc-900' },
};

type RenderFn = (mod: Record<string, React.ComponentType<any>>) => React.ReactNode;

interface PreviewProps {
  children: React.ReactNode | RenderFn;
  className?: string;
  label?: string;
  /** When set, enables version switching for this component. */
  componentName?: string;
}

export function Preview({ children, className, label, componentName }: PreviewProps) {
  const [surface, setSurface] = useState<Surface>('white');
  const [activeVersion, setActiveVersion] = useState<string | null>(null);
  const [versionModule, setVersionModule] = useState<Record<string, React.ComponentType<any>> | null>(null);

  const handleVersionChange = useCallback((version: string | null) => {
    setActiveVersion(version);
    if (!version) {
      setVersionModule(null);
    }
  }, []);

  // Dynamically import the version module when activeVersion changes
  useEffect(() => {
    if (!componentName || !activeVersion) {
      setVersionModule(null);
      return;
    }

    let cancelled = false;

    async function loadVersion() {
      try {
        // Dynamic import of the version file
        const mod = await import(
          /* webpackInclude: /components\/ui\/.*\.v\d+\.tsx$/ */
          `@/components/ui/${componentName}.${activeVersion}.tsx`
        );
        if (!cancelled) {
          setVersionModule(mod);
        }
      } catch (err) {
        console.warn(`Failed to load ${componentName}.${activeVersion}:`, err);
        if (!cancelled) setVersionModule(null);
      }
    }

    loadVersion();
    return () => { cancelled = true; };
  }, [componentName, activeVersion]);

  // Resolve what to render
  let content: React.ReactNode;
  if (typeof children === 'function' && versionModule) {
    content = (children as RenderFn)(versionModule);
  } else if (typeof children === 'function') {
    // No version active — don't call render fn, it expects a module
    // Fall through to render nothing (the canonical import handles this case)
    content = null;
  } else {
    content = children;
  }

  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">{label ?? 'Preview'}</span>
          {componentName && (
            <>
              <div className="h-3 w-px bg-zinc-300" />
              <VersionSwitcher
                componentName={componentName}
                onVersionChange={handleVersionChange}
              />
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(Object.keys(surfaces) as Surface[]).map(s => (
            <button
              key={s}
              onClick={() => setSurface(s)}
              className={cn(
                'rounded px-2 py-1 text-xs transition-colors',
                surface === s
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200 font-medium'
                  : 'text-zinc-500 hover:text-zinc-700'
              )}
            >
              {surfaces[s].label}
            </button>
          ))}
        </div>
      </div>
      <div
        className={cn(
          'relative min-h-32 p-8',
          surfaces[surface].className,
          '[background-image:radial-gradient(circle,_#d4d4d8_1px,_transparent_1px)]',
          '[background-size:20px_20px]',
          className
        )}
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          {content}
        </div>
      </div>
    </div>
  );
}
