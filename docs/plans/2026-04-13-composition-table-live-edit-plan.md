# Composition Table — Live Edit & Source Write — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make each component's Composition story interactive — edit padding/radius cells, watch the real component update live in a preview pane, then Save to write changes directly to the source `.tsx` file and trigger Storybook HMR.

**Architecture:** `CompositionTable` gains `preview` and `sourcePath` props. CSS is injected into a scoped `<style>` tag that overrides old Tailwind classes inside a `[data-preview]` wrapper, giving instant visual feedback. A Vite dev-server middleware handles `POST /composition-write` which string-replaces individual classes in the source file. Stories move `Composition` to second position (after `Default`) so it appears at the top of the autodocs Stories section.

**Tech Stack:** React `useId`/`useState`/`useEffect`, Vite plugin API (`configureServer`), Node `fs.readFileSync`/`writeFileSync`, CSS `!important` class overrides, Storybook HMR.

---

## Key source locations

- `components/docs/CompositionTable.tsx` — complete rewrite in Task 1
- `.storybook/main.ts` — add Vite plugin in Task 2
- `stories/ui/*.stories.tsx` (18 files) — add `preview`/`sourcePath`, reorder in Task 3

## Save strategy — per-class string replacement

Button `md` size in source: `'py-2 px-3 gap-1'` (one string) and `'rounded-sm'` (separate).  
When saving, split compound class strings by whitespace and send one replacement per class:  
`{ old: 'py-2', new: 'py-3' }`, `{ old: 'px-3', new: 'px-4' }`.  
Server calls `source.replaceAll(old, new)` for each pair.  
**Limitation:** global replace affects every occurrence in the file. This is acceptable for a prototyping tool — use `git diff` to review before committing.

## CSS injection strategy

For each row where a field changed (padding / gap / radius):
1. Split old value into old classes, new value into new classes.
2. Compute the union of CSS property→value pairs that the new classes produce (using `TAILWIND_VALUES` map).
3. For each old class, inject: `[data-preview="uid"] .{escaped-old-class} { ...new-props !important; }`

This works because Tailwind axis classes don't overlap (`py-*` only sets vertical, `px-*` only sets horizontal).

---

## Task 1 — Rewrite `CompositionTable.tsx`

**File:** `components/docs/CompositionTable.tsx` (full replacement)

### Step 1: Write the new component

Replace the file with the implementation below. Key points:
- `preview?: React.ReactNode` — real component rendered in preview pane
- `sourcePath?: string` — path relative to project root, e.g. `"components/ui/button.tsx"`
- `useId()` for scoped CSS uid
- `TAILWIND_VALUES` map covering all DS-used classes
- `buildStyleSheet()` diffs rows and generates scoped CSS overrides
- Two-panel layout: table on top, preview below (only when `preview` is provided)
- Save button: calls `POST /composition-write`; hidden when `sourcePath` absent or in production
- Reset button: reverts `rows` state to `initialRows`, clears injected styles
- Detect dev mode: `typeof window !== 'undefined' && window.location.port !== ''` (Storybook dev runs on a port; static build does not serve dynamically)

```tsx
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
  // padding — shorthand
  'p-0':   [{ property: 'padding', value: '0px' }],
  'p-1':   [{ property: 'padding', value: '4px' }],
  'p-2':   [{ property: 'padding', value: '8px' }],
  'p-3':   [{ property: 'padding', value: '12px' }],
  'p-4':   [{ property: 'padding', value: '16px' }],
  // padding-x
  'px-1':   [{ property: 'padding-left', value: '4px' },  { property: 'padding-right', value: '4px' }],
  'px-1.5': [{ property: 'padding-left', value: '6px' },  { property: 'padding-right', value: '6px' }],
  'px-2':   [{ property: 'padding-left', value: '8px' },  { property: 'padding-right', value: '8px' }],
  'px-2.5': [{ property: 'padding-left', value: '10px' }, { property: 'padding-right', value: '10px' }],
  'px-3':   [{ property: 'padding-left', value: '12px' }, { property: 'padding-right', value: '12px' }],
  'px-3.5': [{ property: 'padding-left', value: '14px' }, { property: 'padding-right', value: '14px' }],
  'px-4':   [{ property: 'padding-left', value: '16px' }, { property: 'padding-right', value: '16px' }],
  // padding-y
  'py-0.5': [{ property: 'padding-top', value: '2px' },  { property: 'padding-bottom', value: '2px' }],
  'py-1':   [{ property: 'padding-top', value: '4px' },  { property: 'padding-bottom', value: '4px' }],
  'py-1.5': [{ property: 'padding-top', value: '6px' },  { property: 'padding-bottom', value: '6px' }],
  'py-2':   [{ property: 'padding-top', value: '8px' },  { property: 'padding-bottom', value: '8px' }],
  'py-2.5': [{ property: 'padding-top', value: '10px' }, { property: 'padding-bottom', value: '10px' }],
  'py-3':   [{ property: 'padding-top', value: '12px' }, { property: 'padding-bottom', value: '12px' }],
  'py-4':   [{ property: 'padding-top', value: '16px' }, { property: 'padding-bottom', value: '16px' }],
  // gap
  'gap-0.5': [{ property: 'gap', value: '2px' }],
  'gap-1':   [{ property: 'gap', value: '4px' }],
  'gap-1.5': [{ property: 'gap', value: '6px' }],
  'gap-2':   [{ property: 'gap', value: '8px' }],
  'gap-3':   [{ property: 'gap', value: '12px' }],
  'gap-4':   [{ property: 'gap', value: '16px' }],
  // radius
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

/** Builds a scoped stylesheet that overrides old Tailwind classes with the new values. */
function buildStyleSheet(uid: string, initial: EditRow[], current: EditRow[]): string {
  const rules: string[] = [];

  for (let i = 0; i < initial.length; i++) {
    for (const field of ['padding', 'gap', 'radius'] as const) {
      if (initial[i][field] === current[i][field]) continue;

      const oldClasses = splitClasses(initial[i][field]);
      const newClasses = splitClasses(current[i][field]);

      // Union of all CSS props that the NEW classes would apply
      const newProps = newClasses.flatMap(c => TAILWIND_VALUES[c] ?? []);
      if (newProps.length === 0) continue;

      const declarations = newProps.map(p => `${p.property}: ${p.value} !important`).join('; ');

      for (const oldClass of oldClasses) {
        // CSS.escape handles dots in class names like py-1.5 → py-1\.5
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
  const [rows, setRows]       = useState<EditRow[]>(initialRows);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Detect dev mode: Storybook dev server runs on a port; static build is file:// or portless
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

  // Cleanup on unmount
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
        // Pair up 1:1; leftover new classes are ignored (can't add new classes without AST)
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
    <div className="flex flex-col gap-4">
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

      {/* ── Preview pane (only when preview prop provided) ── */}
      {preview && (
        <div className="rounded-lg border border-zinc-200 overflow-hidden">
          {/* Header row */}
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
          {/* Component render */}
          <div
            data-preview={uid}
            className="flex items-center justify-center p-8 bg-white"
          >
            {preview}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 2: Verify no TypeScript errors

```bash
cd /Users/kevinalvarez/Documents/GitHub/spaceship-design-system
npx tsc --noEmit --project tsconfig.json 2>&1 | grep CompositionTable
```

Expected: no output (no errors in CompositionTable).

### Step 3: Commit

```bash
git add components/docs/CompositionTable.tsx
git commit -m "feat(composition-table): live preview pane with CSS injection and Save-to-file"
```

---

## Task 2 — Add Vite middleware plugin to `.storybook/main.ts`

**File:** `.storybook/main.ts`

### Step 1: Add the plugin function and update `viteFinal`

Add the `compositionWritePlugin` function before the `export default` and update `viteFinal` to register it in dev mode only.

The plugin uses Node's built-in `fs` and `path` modules. Both are available in `.storybook/main.ts` which runs in Node (not the browser).

Add after the existing imports at the top of the file:
```ts
import { readFileSync, writeFileSync } from 'fs';
import type { Plugin } from 'vite';
```

Add this function before `export default defineMain({`:
```ts
function compositionWritePlugin(): Plugin {
  return {
    name: 'composition-write',
    configureServer(server) {
      server.middlewares.use('/composition-write', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { path: filePath, replacements } = JSON.parse(body) as {
              path: string;
              replacements: { old: string; new: string }[];
            };

            const absPath = path.resolve(__dirname, '..', filePath);
            let source = readFileSync(absPath, 'utf-8');

            for (const { old, new: next } of replacements) {
              source = source.replaceAll(old, next);
            }

            writeFileSync(absPath, source, 'utf-8');

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });
    },
  };
}
```

Update the `viteFinal` function:
```ts
async viteFinal(config, { configType }) {
  config.resolve ??= {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '..'),
  };

  if (configType === 'DEVELOPMENT') {
    config.plugins = [
      ...(Array.isArray(config.plugins) ? config.plugins : []),
      compositionWritePlugin(),
    ];
  }

  return config;
},
```

Note: `viteFinal` receives `(config, options)` where options includes `configType`. Check the Storybook `defineMain` type to confirm — it may be `{ configType: 'DEVELOPMENT' | 'PRODUCTION' }`.

### Step 2: Test the middleware manually

Start Storybook dev server:
```bash
npm run storybook
```

In a separate terminal, send a test request (replace with a real file path you can safely test on):
```bash
curl -s -X POST http://localhost:6006/composition-write \
  -H "Content-Type: application/json" \
  -d '{"path":"components/ui/button.tsx","replacements":[]}' | cat
```

Expected: `{"ok":true}` with no file changes (empty replacements array).

### Step 3: Commit

```bash
git add .storybook/main.ts
git commit -m "feat(storybook): add compositionWritePlugin Vite middleware for dev-only source file writes"
```

---

## Task 3 — Update all 18 story files

For each story file below:
1. Move the `Composition` export to be the **second export** (immediately after `export const Default: Story = {}` or equivalent first story)
2. Update the `render` to pass `preview` and `sourcePath` props

**Do files in groups — commit after each group.**

### Previews per component

The preview should show a representative variant that exercises the most-used composition row (typically the default size/surface).

| Story file | `sourcePath` | `preview` JSX |
|---|---|---|
| `Button.stories.tsx` | `components/ui/button.tsx` | `<div className="flex gap-2"><Button size="sm" disableMotion>Sm</Button><Button size="md" disableMotion>Md</Button><Button size="lg" disableMotion>Lg</Button></div>` |
| `Tag.stories.tsx` | `components/ui/tag.tsx` | `<div className="flex gap-2"><Tag size="sm">Small</Tag><Tag size="md">Medium</Tag></div>` |
| `ChatBubble.stories.tsx` | `components/ui/chat-bubble.tsx` | `<ChatBubble>Hello there!</ChatBubble>` |
| `TabBar.stories.tsx` | `components/ui/tab-bar.tsx` | (see note — needs mock state, use inline wrapper) |
| `ChatInputBox.stories.tsx` | `components/ui/chat-input-box.tsx` | `<ChatInputBox disableMotion />` |
| `Modal.stories.tsx` | `components/ui/modal.tsx` | `<Modal open disableMotion><ModalHeader><ModalTitle>Title</ModalTitle></ModalHeader><ModalFooter><Button size="sm">OK</Button></ModalFooter></Modal>` |
| `DropdownMenu.stories.tsx` | `components/ui/dropdown-menu.tsx` | Inline wrapper with open dropdown (see note) |
| `CheckboxGroup.stories.tsx` | `components/ui/checkbox-group.tsx` | Existing AllOptions story render |
| `RadioGroup.stories.tsx` | `components/ui/radio-group.tsx` | Existing AllOptions story render |
| `SortableList.stories.tsx` | `components/ui/sortable-list.tsx` | Existing Default story render |
| `TaskList.stories.tsx` | `components/ui/task-list.tsx` | `<TaskList items={['First task', 'Second task']} completedCount={1} disableMotion />` |
| `ApprovalCard.stories.tsx` | `components/ui/approval-card.tsx` | `<ApprovalCard title="Plan" disableMotion><p className="text-sm">Content</p></ApprovalCard>` |
| `ClarificationCard.stories.tsx` | `components/ui/clarification-card.tsx` | Use a single-question mock from `stories/_helpers/mocks.ts` |
| `FolderTabs.stories.tsx` | `components/ui/folder-tabs.tsx` | Inline wrapper with 2 tabs |
| `FolderTabsV2.stories.tsx` | `components/ui/folder-tabs-v2.tsx` | Inline wrapper with 2 tabs |
| `ChatThread.stories.tsx` | `components/ui/chat-thread.tsx` | `<div className="w-64"><ChatThread><ChatBubble>Hi</ChatBubble></ChatThread></div>` |
| `ChatMessage.stories.tsx` | `components/ui/chat-message.tsx` | `<ChatMessage content="Hello **world**. This is a `code` span." />` |
| `Thinking.stories.tsx` | `components/ui/thinking.tsx` | `<div className="flex gap-3 items-center"><ThinkingDots /><ThinkingSaucer /><Thinking disableMotion /></div>` |

**Notes on complex previews:**

- **TabBar** — needs a controlled `value` state. Use a simple inline wrapper component defined above the `COMPOSITION` const:
  ```tsx
  function TabBarPreview() {
    const [value, setValue] = useState('a');
    return (
      <TabBar value={value} onValueChange={setValue}>
        <TabBarItem value="a">Files</TabBarItem>
        <TabBarItem value="b">Preview</TabBarItem>
      </TabBar>
    );
  }
  ```
  Then `preview={<TabBarPreview />}`.

- **DropdownMenu** — always-open dropdown is hard to render statically. Use a wrapper that forces open, or skip `preview` for this component and leave it as `undefined`. The CSS injection still applies to the table; preview is just absent.

- **CheckboxGroup / RadioGroup / SortableList** — reuse the same data already used in their other stories (e.g. copy `ITEMS` or `QUESTIONS` array).

### Step-by-step for each file

For EACH of the 18 files:

**Step A:** Read the current file to find the Composition export location and the first story name.

**Step B:** Edit the file:
- Move `Composition` export to immediately after the first story export
- Update `render` to:
  ```tsx
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/component-name.tsx"
      preview={<PreviewJSX />}
    />
  ),
  ```

**Step C:** Verify no imports are missing (add any component imports needed for the preview JSX).

### Group 1 commit (Button, Tag, ChatBubble, Keycap, TabBar, ChatInputBox)

```bash
git add stories/ui/Button.stories.tsx stories/ui/Tag.stories.tsx stories/ui/ChatBubble.stories.tsx stories/ui/TabBar.stories.tsx stories/ui/ChatInputBox.stories.tsx
git commit -m "feat(stories): add live preview to Composition story — simple components"
```

### Group 2 commit (Modal, DropdownMenu, CheckboxGroup, RadioGroup, SortableList, TaskList)

```bash
git add stories/ui/Modal.stories.tsx stories/ui/DropdownMenu.stories.tsx stories/ui/CheckboxGroup.stories.tsx stories/ui/RadioGroup.stories.tsx stories/ui/SortableList.stories.tsx stories/ui/TaskList.stories.tsx
git commit -m "feat(stories): add live preview to Composition story — multi-part components"
```

### Group 3 commit (ApprovalCard, ClarificationCard, FolderTabs, FolderTabsV2, ChatThread, ChatMessage, Thinking, ShimmerText)

```bash
git add stories/ui/ApprovalCard.stories.tsx stories/ui/ClarificationCard.stories.tsx stories/ui/FolderTabs.stories.tsx stories/ui/FolderTabsV2.stories.tsx stories/ui/ChatThread.stories.tsx stories/ui/ChatMessage.stories.tsx stories/ui/Thinking.stories.tsx stories/ui/ShimmerText.stories.tsx
git commit -m "feat(stories): add live preview to Composition story — complex components"
```

---

## Task 4 — Verification

### Step 1: Lint

```bash
npm run lint 2>&1 | grep -E "^/" | grep -v "node_modules"
```

Expected: Only pre-existing errors (the 17 `useState in render` warnings documented in session memory). Zero new errors.

### Step 2: Storybook build

```bash
npx storybook build 2>&1 | tail -5
```

Expected: `Storybook build completed successfully`

### Step 3: Dev server smoke test

```bash
npm run storybook
```

1. Open `http://localhost:6006`
2. Navigate to **Components / Button / Composition**
3. Verify: table appears, then below it a Preview pane with all 3 Button sizes rendered
4. Edit the `md` row's Padding cell: change `py-2 px-3` to `py-4 px-6`
5. Verify: the medium Button's padding visually increases in the Preview pane immediately
6. Click **Save ↓**
7. Verify: button shows "Saving…" then "✓ Saved"
8. Storybook HMR triggers — verify `button.tsx` has `py-4 px-6` in the `md` size array
9. Click **Reset** — preview reverts; note that the source file still has the changed value (Reset is UI-only)
10. Manually revert `button.tsx` with git: `git checkout components/ui/button.tsx`

### Step 4: Static build Save-button check

In the static build (no port), the Save button should be hidden. Open `storybook-static/index.html` in a browser via `file://` and check the Composition story — Save button absent, table is still editable.

---

## Appendix — `viteFinal` signature in `@storybook/nextjs-vite`

The `defineMain` type in `@storybook/nextjs-vite/node` exposes `viteFinal` as:
```ts
viteFinal?: (config: UserConfig, options: Options) => UserConfig | Promise<UserConfig>
```
where `options.configType` is `'DEVELOPMENT' | 'PRODUCTION'`. If the TypeScript type doesn't expose `configType`, cast options:
```ts
async viteFinal(config, options) {
  const { configType } = options as { configType: string };
  ...
}
```
