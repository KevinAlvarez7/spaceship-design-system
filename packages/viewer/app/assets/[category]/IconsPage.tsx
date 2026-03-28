'use client';

import { lucideIcons } from '@/assets/lucide-icons';
import { LucideIconCard } from '@/components/viewer/LucideIconCard';

export function IconsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Icons</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Lucide icons used across the design system. Add new icons to{' '}
          <code>assets/lucide-icons.ts</code>.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {lucideIcons.map(entry => (
          <LucideIconCard key={entry.importName} entry={entry} />
        ))}
      </div>
    </div>
  );
}
