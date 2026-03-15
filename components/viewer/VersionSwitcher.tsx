'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VersionSwitcherProps {
  componentName: string;
  onVersionChange: (version: string | null) => void;
}

/**
 * Fetches available versions for a component and renders pill toggles.
 * Returns null when no versions exist (component is not forked).
 */
export function VersionSwitcher({ componentName, onVersionChange }: VersionSwitcherProps) {
  const [versions, setVersions] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  // Fetch versions from API
  useEffect(() => {
    let cancelled = false;

    async function fetchVersions() {
      try {
        const res = await fetch(`/api/versions/${componentName}`);
        const data = await res.json();
        if (!cancelled && data.versions.length > 0) {
          setVersions(data.versions);

          // Restore from localStorage or default to null (canonical)
          const stored = localStorage.getItem(`ds-version-${componentName}`);
          if (stored && data.versions.includes(stored)) {
            setActive(stored);
            onVersionChange(stored);
          }
        }
      } catch {
        // API not available — no versions
      }
    }

    fetchVersions();
    return () => { cancelled = true; };
  }, [componentName, onVersionChange]);

  const select = useCallback((version: string | null) => {
    setActive(version);
    onVersionChange(version);
    if (version) {
      localStorage.setItem(`ds-version-${componentName}`, version);
    } else {
      localStorage.removeItem(`ds-version-${componentName}`);
    }
  }, [componentName, onVersionChange]);

  if (versions.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => select(null)}
        className={cn(
          'rounded px-2 py-1 text-xs transition-colors',
          active === null
            ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200 font-medium'
            : 'text-zinc-500 hover:text-zinc-700'
        )}
      >
        Current
      </button>
      {versions.map(v => (
        <button
          key={v}
          onClick={() => select(v)}
          className={cn(
            'rounded px-2 py-1 text-xs transition-colors uppercase',
            active === v
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200 font-medium'
              : 'text-zinc-500 hover:text-zinc-700'
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
