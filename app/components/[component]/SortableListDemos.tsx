"use client";

import { useState } from 'react';
import { SortableList } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';

const DEFAULT_ITEMS = ['Authentication', 'Data models', 'API endpoints', 'Frontend views'];
const TASK_ITEMS = ['Design wireframes', 'Review with stakeholders', 'Implement UI', 'Write tests', 'Deploy to staging'];

export function SortableListDemos() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [taskItems, setTaskItems] = useState(TASK_ITEMS);
  const [noDiv, setNoDiv] = useState(DEFAULT_ITEMS);

  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <Preview label="Drag the handle to reorder">
          <div className="w-full max-w-sm">
            <SortableList items={items} onReorder={setItems} />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Custom renderItem</h2>
        <Preview label="Custom row content via renderItem prop">
          <div className="w-full max-w-sm">
            <SortableList
              items={taskItems}
              onReorder={setTaskItems}
              renderItem={(item, index) => (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-(--text-tertiary) [font-size:var(--font-size-xs)] w-4 text-right shrink-0">{index + 1}</span>
                  <span className="[font-size:var(--font-size-sm)] text-(--text-primary)">{item}</span>
                </div>
              )}
            />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">No dividers</h2>
        <Preview label="dividers={false}">
          <div className="w-full max-w-sm">
            <SortableList items={noDiv} onReorder={setNoDiv} dividers={false} />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">surface=&quot;default&quot;</h2>
        <Preview label="No shadow-border — flat surface for use on cards">
          <div className="w-full max-w-sm">
            <SortableList items={DEFAULT_ITEMS} onReorder={() => {}} surface="default" />
          </div>
        </Preview>
      </section>
    </>
  );
}
