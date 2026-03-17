'use client';

import { cn } from '@/lib/utils';
import type { ControlDef } from '@/lib/playground-config';

interface PropsPanelProps {
  controls: ControlDef[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onReset: () => void;
  isModified?: boolean;
}

// ─── Individual control renderers ─────────────────────────────────────────────

function SelectControl({
  control,
  value,
  onChange,
}: {
  control: Extract<ControlDef, { type: 'select' }>;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-500">
        {control.label ?? control.name}
      </label>
      <select
        value={String(value ?? control.defaultValue)}
        onChange={(e) => onChange(control.name, e.target.value)}
        className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
      >
        {control.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function BooleanControl({
  control,
  value,
  onChange,
}: {
  control: Extract<ControlDef, { type: 'boolean' }>;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}) {
  const checked = value === true;
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs font-medium text-zinc-500">
        {control.label ?? control.name}
      </label>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(control.name, !checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-zinc-800' : 'bg-zinc-200',
        )}
      >
        <span
          className={cn(
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}

function TextControl({
  control,
  value,
  onChange,
}: {
  control: Extract<ControlDef, { type: 'text' }>;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-500">
        {control.label ?? control.name}
      </label>
      <input
        type="text"
        value={String(value ?? control.defaultValue)}
        placeholder={control.placeholder}
        onChange={(e) => onChange(control.name, e.target.value)}
        className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
      />
    </div>
  );
}

function ControlItem({
  control,
  value,
  onChange,
}: {
  control: ControlDef;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}) {
  if (control.type === 'select') return <SelectControl control={control} value={value} onChange={onChange} />;
  if (control.type === 'boolean') return <BooleanControl control={control} value={value} onChange={onChange} />;
  if (control.type === 'text') return <TextControl control={control} value={value} onChange={onChange} />;
  return null;
}

// ─── PropsPanel ───────────────────────────────────────────────────────────────

export function PropsPanel({
  controls,
  values,
  onChange,
  onReset,
  isModified,
}: PropsPanelProps) {
  // Separate ungrouped from grouped controls
  const ungrouped = controls.filter((c) => !c.group);
  const groups = new Map<string, ControlDef[]>();
  for (const c of controls) {
    if (!c.group) continue;
    if (!groups.has(c.group)) groups.set(c.group, []);
    groups.get(c.group)!.push(c);
  }

  return (
    <div className="flex flex-col rounded-lg border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
        <span className="text-sm font-semibold text-zinc-700">Props</span>
        <button
          onClick={onReset}
          disabled={!isModified}
          className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 p-4">
        {/* Ungrouped */}
        {ungrouped.map((control) => (
          <ControlItem
            key={control.name}
            control={control}
            value={values[control.name]}
            onChange={onChange}
          />
        ))}

        {/* Grouped */}
        {Array.from(groups.entries()).map(([groupName, groupControls]) => (
          <div key={groupName} className="flex flex-col gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {groupName}
            </div>
            {groupControls.map((control) => (
              <ControlItem
                key={control.name}
                control={control}
                value={values[control.name]}
                onChange={onChange}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
