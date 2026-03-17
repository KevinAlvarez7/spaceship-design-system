"use client";

import { TaskList } from '@/components/ui';
import { Preview }  from '@/components/viewer/Preview';

const ITEMS = [
  'Set up project repository',
  'Design database schema',
  'Implement authentication',
  'Build API endpoints',
];

export function TaskListDemos() {
  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Mixed states</h2>
        <Preview label="completedCount={2}, isActive={true} — completed, in-progress, and pending">
          <div className="w-full max-w-sm">
            <TaskList items={ITEMS} completedCount={2} isActive />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Collapsed</h2>
        <Preview label="defaultExpanded={false} — header only, click to expand">
          <div className="w-full max-w-sm">
            <TaskList items={ITEMS} completedCount={1} defaultExpanded={false} />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">All complete</h2>
        <Preview label="completedCount={items.length}, isActive={false} — full progress bar">
          <div className="w-full max-w-sm">
            <TaskList items={ITEMS} completedCount={ITEMS.length} isActive={false} />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Shadow-border surface</h2>
        <Preview label='surface="shadow-border"'>
          <div className="w-full max-w-sm">
            <TaskList items={ITEMS} completedCount={1} surface="shadow-border" />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With timestamp</h2>
        <Preview label='updatedAt="Updated 2m ago"'>
          <div className="w-full max-w-sm">
            <TaskList items={ITEMS} completedCount={2} updatedAt="Updated 2m ago" />
          </div>
        </Preview>
      </section>
    </>
  );
}
