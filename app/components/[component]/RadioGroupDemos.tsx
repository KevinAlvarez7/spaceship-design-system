"use client";

import { useState } from 'react';
import { RadioGroup, RadioItem } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';

export function RadioGroupDemos() {
  const [value, setValue] = useState('option-1');

  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <Preview label="shadow-border surface, radio indicator">
          <div className="w-full max-w-sm">
            <RadioGroup value={value} onChange={setValue} aria-label="Plan selection">
              <RadioItem value="option-1">Starter</RadioItem>
              <RadioItem value="option-2">Pro</RadioItem>
              <RadioItem value="option-3">Enterprise</RadioItem>
            </RadioGroup>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">No dividers</h2>
        <Preview label="dividers={false}">
          <div className="w-full max-w-sm">
            <RadioGroup defaultValue="option-1" dividers={false} aria-label="Plan selection">
              <RadioItem value="option-1">Starter</RadioItem>
              <RadioItem value="option-2">Pro</RadioItem>
              <RadioItem value="option-3">Enterprise</RadioItem>
            </RadioGroup>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled items</h2>
        <Preview label="Individual items can be disabled">
          <div className="w-full max-w-sm">
            <RadioGroup defaultValue="option-1" aria-label="Plan selection">
              <RadioItem value="option-1">Starter</RadioItem>
              <RadioItem value="option-2" disabled>Pro (unavailable)</RadioItem>
              <RadioItem value="option-3">Enterprise</RadioItem>
            </RadioGroup>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">indicator=&quot;none&quot;</h2>
        <Preview label="Hides the radio circle — only row highlight shows selection">
          <div className="w-full max-w-sm">
            <RadioGroup defaultValue="option-1" indicator="none" aria-label="Plan selection">
              <RadioItem value="option-1">Starter</RadioItem>
              <RadioItem value="option-2">Pro</RadioItem>
              <RadioItem value="option-3">Enterprise</RadioItem>
            </RadioGroup>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">surface=&quot;default&quot;</h2>
        <Preview label="No shadow-border — flat surface for use on cards">
          <div className="w-full max-w-sm">
            <RadioGroup defaultValue="option-1" surface="default" aria-label="Plan selection">
              <RadioItem value="option-1">Starter</RadioItem>
              <RadioItem value="option-2">Pro</RadioItem>
              <RadioItem value="option-3">Enterprise</RadioItem>
            </RadioGroup>
          </div>
        </Preview>
      </section>
    </>
  );
}
