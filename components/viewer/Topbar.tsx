'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Terminal } from 'lucide-react';

const dsRepoPath = process.env.NEXT_PUBLIC_DS_REPO_PATH;

export function Topbar({ title }: { title: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('ds-preview-theme') as 'light' | 'dark' | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    }
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ds-preview-theme', next);
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <h1 className="text-sm font-medium text-zinc-700">{title}</h1>
      <div className="flex items-center gap-3">
        {dsRepoPath ? (
          <a
            href={`vscode://file${dsRepoPath}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <Terminal className="h-3.5 w-3.5" />
            Edit in Claude Code
          </a>
        ) : (
          <span
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-400 cursor-not-allowed"
            title="Set NEXT_PUBLIC_DS_REPO_PATH in .env.local to enable"
          >
            <Terminal className="h-3.5 w-3.5" />
            Edit in Claude Code
          </span>
        )}
        <div className="h-4 w-px bg-zinc-200" />
        <span className="text-xs text-zinc-400">Preview theme</span>
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors"
          aria-label="Toggle DS preview theme"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
