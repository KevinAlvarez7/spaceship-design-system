import { Keycap, KeyCombo }  from '@/components/ui';
import { Preview }            from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }          from '@/components/viewer/CodeBlock';

const KEYCAP_PROPS: PropRow[] = [
  { name: 'pressed',   type: 'boolean',                       default: 'false',      description: 'Programmatic press state — zeroes the depth shadow layer.' },
  { name: 'surface',   type: '"default" | "shadow-border"',   default: '"default"',  description: 'Surface variant — both use the keycap shadow system.' },
  { name: 'className', type: 'string',                        default: '—',          description: 'Additional classes.' },
  { name: 'children',  type: 'ReactNode',                     default: '—',          description: 'Key label content.' },
];

const KEYCOMBO_PROPS: PropRow[] = [
  { name: 'separator', type: 'ReactNode',                     default: '"+"',        description: 'Character or element rendered between keys.' },
  { name: 'surface',   type: '"default" | "shadow-border"',   default: '"default"',  description: 'Passed through to each auto-wrapped Keycap.' },
  { name: 'children',  type: 'ReactNode',                     default: '—',          description: 'Keycap elements. String children are auto-wrapped.' },
];

const USAGE = `import { Keycap, KeyCombo } from '@/components/ui';

// Single key
<Keycap>Esc</Keycap>
<Keycap>↵</Keycap>
<Keycap>⌘</Keycap>

// Key combination — Keycap children with + separator
<KeyCombo>
  <Keycap>⌘</Keycap>
  <Keycap>K</Keycap>
</KeyCombo>

// Custom separator
<KeyCombo separator="then">
  <Keycap>Esc</Keycap>
  <Keycap>Esc</Keycap>
</KeyCombo>

// Programmatic press (sync with keydown listener)
<Keycap pressed={isEnterDown}>↵</Keycap>`;

export function KeycapPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Keycap</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Keyboard key badge with a 3-layer shadow system: outline ring, inner softness, and a
          flat bottom edge that gives the key physical depth. On press, the depth layer zeroes
          out — no translate, shadow only.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Keys</h2>
        <Preview label="Common keys — click/tap to press">
          <Keycap>Esc</Keycap>
          <Keycap>Tab</Keycap>
          <Keycap>⇧</Keycap>
          <Keycap>⌘</Keycap>
          <Keycap>⌥</Keycap>
          <Keycap>⌃</Keycap>
          <Keycap>↵</Keycap>
          <Keycap>Space</Keycap>
          <Keycap>A</Keycap>
          <Keycap>1</Keycap>
          <Keycap>F1</Keycap>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Key Combinations</h2>
        <Preview label="KeyCombo with + separator">
          <KeyCombo><Keycap>⌘</Keycap><Keycap>K</Keycap></KeyCombo>
          <KeyCombo><Keycap>⌘</Keycap><Keycap>⇧</Keycap><Keycap>P</Keycap></KeyCombo>
          <KeyCombo><Keycap>⌃</Keycap><Keycap>C</Keycap></KeyCombo>
          <KeyCombo><Keycap>⌥</Keycap><Keycap>Tab</Keycap></KeyCombo>
        </Preview>
        <Preview label="With hint label">
          <div className="flex items-center gap-1.5">
            <KeyCombo><Keycap>↑</Keycap><Keycap>↓</Keycap></KeyCombo>
            <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary)">navigate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Keycap>↵</Keycap>
            <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary)">confirm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Keycap>Esc</Keycap>
            <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary)">cancel</span>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Pressed State</h2>
        <Preview label="pressed=true — depth shadow zeroed">
          <Keycap pressed>⌘</Keycap>
          <Keycap pressed>K</Keycap>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Keycap Props</h2>
        <PropsTable props={KEYCAP_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">KeyCombo Props</h2>
        <PropsTable props={KEYCOMBO_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
