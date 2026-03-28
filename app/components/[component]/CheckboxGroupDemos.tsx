"use client";

import { useState } from 'react';
import { CheckboxGroup, CheckboxItem } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';

export function CheckboxGroupDemos() {
  const [value, setValue] = useState<string[]>(['notifications']);

  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <Preview label="shadow-border surface, checkbox indicator">
          <div className="w-full max-w-sm">
            <CheckboxGroup value={value} onChange={setValue} aria-label="Notification preferences">
              <CheckboxItem value="notifications">Email notifications</CheckboxItem>
              <CheckboxItem value="updates">Product updates</CheckboxItem>
              <CheckboxItem value="marketing">Marketing emails</CheckboxItem>
            </CheckboxGroup>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">No dividers</h2>
        <Preview label="dividers={false}">
          <div className="w-full max-w-sm">
            <CheckboxGroup defaultValue={['notifications']} dividers={false} aria-label="Preferences">
              <CheckboxItem value="notifications">Email notifications</CheckboxItem>
              <CheckboxItem value="updates">Product updates</CheckboxItem>
              <CheckboxItem value="marketing">Marketing emails</CheckboxItem>
            </CheckboxGroup>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled items</h2>
        <Preview label="Individual items can be disabled">
          <div className="w-full max-w-sm">
            <CheckboxGroup defaultValue={['notifications']} aria-label="Preferences">
              <CheckboxItem value="notifications">Email notifications</CheckboxItem>
              <CheckboxItem value="updates" disabled>Product updates (admin only)</CheckboxItem>
              <CheckboxItem value="marketing">Marketing emails</CheckboxItem>
            </CheckboxGroup>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">surface=&quot;default&quot;</h2>
        <Preview label="No shadow-border — flat surface for use on cards">
          <div className="w-full max-w-sm">
            <CheckboxGroup defaultValue={['notifications']} surface="default" aria-label="Preferences">
              <CheckboxItem value="notifications">Email notifications</CheckboxItem>
              <CheckboxItem value="updates">Product updates</CheckboxItem>
              <CheckboxItem value="marketing">Marketing emails</CheckboxItem>
            </CheckboxGroup>
          </div>
        </Preview>
      </section>
    </>
  );
}
