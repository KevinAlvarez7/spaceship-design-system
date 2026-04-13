'use client';

import { useState, useId, useEffect, useRef, type ReactNode } from 'react';

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type CompositionEntry = {
  part: string;
  variant?: string;
  padding: string;
  gap?: string;
  radius: string;
  note?: string;
};

type EditRow = {
  part: string;
  variant: string;
  padding: string;
  gap: string;
  radius: string;
  note: string;
};

function toEditRow(e: CompositionEntry): EditRow {
  return {
    part:    e.part,
    variant: e.variant ?? '—',
    padding: e.padding,
    gap:     e.gap     ?? '—',
    radius:  e.radius,
    note:    e.note    ?? '',
  };
}

// ━━━ Tailwind → CSS value map ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type CSSProp = { property: string; value: string };

const TAILWIND_VALUES: Record<string, CSSProp[]> = {
  'p-0':   [{ property: 'padding', value: '0px' }],
  'p-1':   [{ property: 'padding', value: '4px' }],
  'p-2':   [{ property: 'padding', value: '8px' }],
  'p-3':   [{ property: 'padding', value: '12px' }],
  'p-4':   [{ property: 'padding', value: '16px' }],
  'px-1':   [{ property: 'padding-left', value: '4px' },  { property: 'padding-right', value: '4px' }],
  'px-1.5': [{ property: 'padding-left', value: '6px' },  { property: 'padding-right', value: '6px' }],
  'px-2':   [{ property: 'padding-left', value: '8px' },  { property: 'padding-right', value: '8px' }],
  'px-2.5': [{ property: 'padding-left', value: '10px' }, { property: 'padding-right', value: '10px' }],
  'px-3':   [{ property: 'padding-left', value: '12px' }, { property: 'padding-right', value: '12px' }],
  'px-3.5': [{ property: 'padding-left', value: '14px' }, { property: 'padding-right', value: '14px' }],
  'px-4':   [{ property: 'padding-left', value: '16px' }, { property: 'padding-right', value: '16px' }],
  'py-0.5': [{ property: 'padding-top', value: '2px' },  { property: 'padding-bottom', value: '2px' }],
  'py-1':   [{ property: 'padding-top', value: '4px' },  { property: 'padding-bottom', value: '4px' }],
  'py-1.5': [{ property: 'padding-top', value: '6px' },  { property: 'padding-bottom', value: '6px' }],
  'py-2':   [{ property: 'padding-top', value: '8px' },  { property: 'padding-bottom', value: '8px' }],
  'py-2.5': [{ property: 'padding-top', value: '10px' }, { property: 'padding-bottom', value: '10px' }],
  'py-3':   [{ property: 'padding-top', value: '12px' }, { property: 'padding-bottom', value: '12px' }],
  'py-4':   [{ property: 'padding-top', value: '16px' }, { property: 'padding-bottom', value: '16px' }],
  'gap-0.5': [{ property: 'gap', value: '2px' }],
  'gap-1':   [{ property: 'gap', value: '4px' }],
  'gap-1.5': [{ property: 'gap', value: '6px' }],
  'gap-2':   [{ property: 'gap', value: '8px' }],
  'gap-3':   [{ property: 'gap', value: '12px' }],
  'gap-4':   [{ property: 'gap', value: '16px' }],
  'rounded-none': [{ property: 'border-radius', value: '0px' }],
  'rounded-xs':   [{ property: 'border-radius', value: '2px' }],
  'rounded-sm':   [{ property: 'border-radius', value: '4px' }],
  'rounded':      [{ property: 'border-radius', value: '4px' }],
  'rounded-md':   [{ property: 'border-radius', value: '6px' }],
  'rounded-lg':   [{ property: 'border-radius', value: '8px' }],
  'rounded-xl':   [{ property: 'border-radius', value: '12px' }],
  'rounded-2xl':  [{ property: 'border-radius', value: '16px' }],
  'rounded-3xl':  [{ property: 'border-radius', value: '24px' }],
  'rounded-full': [{ property: 'border-radius', value: '9999px' }],
  'rounded-t-lg': [
    { property: 'border-top-left-radius',  value: '8px' },
    { property: 'border-top-right-radius', value: '8px' },
  ],
};

// ━━━ CSS injection ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function splitClasses(str: string): string[] {
  return str.split(/\s+/).filter(c => c && c !== '—');
}

/** Builds a scoped stylesheet overriding old Tailwind classes with new CSS values. */
function buildStyleSheet(uid: string, initial: EditRow[], current: EditRow[]): string {
  const rules: string[] = [];

  for (let i = 0; i < initial.length; i++) {
    for (const field of ['padding', 'gap', 'radius'] as const) {
      if (initial[i][field] === current[i][field]) continue;

      const oldClasses = splitClasses(initial[i][field]);
      const newClasses = splitClasses(current[i][field]);

      const newProps = newClasses.flatMap(c => TAILWIND_VALUES[c] ?? []);
      if (newProps.length === 0) continue;

      const declarations = newProps.map(p => `${p.property}: ${p.value} !important`).join('; ');

      for (const oldClass of oldClasses) {
        const escaped = CSS.escape(oldClass);
        rules.push(`[data-preview="${uid}"] .${escaped} { ${declarations}; }`);
      }
    }
  }

  return rules.join('\n');
}

// ━━━ Radius preview swatch ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RADIUS_CSS: Record<string, string> = {
  'rounded-none': '0px',    'rounded-xs': '2px',
  'rounded-sm': '4px',      'rounded': '4px',
  'rounded-md': '6px',      'rounded-lg': '8px',
  'rounded-xl': '12px',     'rounded-2xl': '16px',
  'rounded-3xl': '24px',    'rounded-full': '9999px',
  'rounded-t-lg': '8px 8px 0 0',
};

function RadiusPreview({ radiusClass }: { radiusClass: string }) {
  const cssValue = RADIUS_CSS[radiusClass];
  if (!cssValue) return null;
  return (
    <div aria-hidden style={{
      width: 18, height: 18,
      background: '#dbeafe', border: '1.5px solid #93c5fd',
      borderRadius: cssValue, flexShrink: 0, display: 'inline-block',
    }} />
  );
}

// ━━━ EditableCell ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function EditableCell({ value, onChange, mono = true, muted = false }: {
  value: string; onChange: (v: string) => void; mono?: boolean; muted?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      className={[
        'bg-transparent w-full outline-none rounded px-0.5 -mx-0.5',
        'hover:bg-zinc-100 focus:bg-zinc-100 cursor-text text-xs',
        mono ? 'font-mono' : '',
        muted ? 'text-zinc-400' : 'text-zinc-700',
      ].join(' ')}
    />
  );
}

// ━━━ CompositionTable ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function CompositionTable({
  entries: initialEntries,
  preview,
  sourcePath,
}: {
  entries: CompositionEntry[];
  preview?: ReactNode;
  sourcePath?: string;
}) {
  const rawUid = useId();
  const uid = rawUid.replace(/:/g, '');

  const initialRows = initialEntries.map(toEditRow);
  const [rows, setRows]           = useState<EditRow[]>(initialRows);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const isDev = typeof window !== 'undefined' && !!window.location.port;

  // ─── CSS injection ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!preview) return;

    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      document.head.appendChild(styleRef.current);
    }

    styleRef.current.textContent = buildStyleSheet(uid, initialRows, rows);

    return () => {
      if (styleRef.current) {
        styleRef.current.textContent = '';
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, uid]);

  useEffect(() => {
    return () => { styleRef.current?.remove(); styleRef.current = null; };
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  function update(index: number, field: keyof EditRow, value: string) {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  }

  function handleReset() {
    setRows(initialRows);
  }

  async function handleSave() {
    if (!sourcePath || !isDev) return;

    const replacements: { old: string; new: string }[] = [];

    for (let i = 0; i < initialRows.length; i++) {
      for (const field of ['padding', 'gap', 'radius'] as const) {
        if (initialRows[i][field] === rows[i][field]) continue;
        const oldClasses = splitClasses(initialRows[i][field]);
        const newClasses = splitClasses(rows[i][field]);
        oldClasses.forEach((oldCls, idx) => {
          const newCls = newClasses[idx];
          if (newCls && newCls !== oldCls) {
            replacements.push({ old: oldCls, new: newCls });
          }
        });
      }
    }

    if (replacements.length === 0) return;

    setSaveState('saving');
    try {
      const res = await fetch('/composition-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: sourcePath, replacements }),
      });
      if (!res.ok) throw new Error('write failed');
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }

  const hasChanges = rows.some((r, i) =>
    (['padding', 'gap', 'radius'] as const).some(f => r[f] !== initialRows[i][f])
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 p-6">
      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              {(['Part', 'Variant', 'Padding', 'Gap', 'Radius', 'Note'] as const).map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row, i) => {
              const isNewGroup = i > 0 && rows[i - 1].part !== row.part;
              const radiusClass = row.radius.split(' ')[0];
              return (
                <tr key={i} className={['bg-white hover:bg-zinc-50 transition-colors', isNewGroup ? 'border-t-2 border-zinc-200' : ''].join(' ')}>
                  <td className="px-4 py-2">
                    <input value={row.part} onChange={e => update(i, 'part', e.target.value)}
                      className="bg-transparent w-full outline-none rounded px-0.5 -mx-0.5 hover:bg-zinc-100 focus:bg-zinc-100 cursor-text font-mono text-xs font-semibold text-zinc-800" />
                  </td>
                  <td className="px-4 py-2"><EditableCell value={row.variant} onChange={v => update(i, 'variant', v)} muted={row.variant === '—'} /></td>
                  <td className="px-4 py-2"><EditableCell value={row.padding} onChange={v => update(i, 'padding', v)} muted={row.padding === '—'} /></td>
                  <td className="px-4 py-2"><EditableCell value={row.gap}     onChange={v => update(i, 'gap', v)}     muted={row.gap === '—'} /></td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {row.radius !== '—' && <RadiusPreview radiusClass={radiusClass} />}
                      <EditableCell value={row.radius} onChange={v => update(i, 'radius', v)} muted={row.radius === '—'} />
                    </div>
                  </td>
                  <td className="px-4 py-2"><EditableCell value={row.note} onChange={v => update(i, 'note', v)} mono={false} muted /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Preview pane ── */}
      {preview && (
        <div className="rounded-lg border border-zinc-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 bg-zinc-50">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Preview</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="text-xs px-2 py-1 rounded border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
              {sourcePath && isDev && (
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saveState === 'saving'}
                  className={[
                    'text-xs font-mono px-2 py-1 rounded border transition-colors',
                    saveState === 'saved'  ? 'border-green-300 bg-green-50 text-green-700' :
                    saveState === 'error'  ? 'border-red-300 bg-red-50 text-red-700' :
                    saveState === 'saving' ? 'border-zinc-200 bg-zinc-50 text-zinc-400' :
                    !hasChanges            ? 'border-zinc-200 bg-white text-zinc-400 cursor-not-allowed' :
                                            'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400',
                  ].join(' ')}
                >
                  {saveState === 'saved' ? '✓ Saved' : saveState === 'error' ? '✗ Error' : saveState === 'saving' ? 'Saving…' : 'Save ↓'}
                </button>
              )}
            </div>
          </div>
          <div data-preview={uid} className="flex items-center justify-center p-8 bg-white">
            {preview}
          </div>
        </div>
      )}
    </div>
  );
}
