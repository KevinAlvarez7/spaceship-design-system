import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { ClarificationCardKeycapDemos } from './ClarificationCardKeycapDemos';

const CARD_PROPS: PropRow[] = [
  { name: 'questions',     type: 'ClarificationQuestion[]',    default: '—',               description: 'Array of questions. Each can be type single, multi, or rank (defaults to single when type is omitted).' },
  { name: 'onSubmit',      type: '(answers: ClarificationAnswer[]) => void', default: '—', description: 'Called when the user submits (⇧↵). Returns one ClarificationAnswer per question (null = skipped).' },
  { name: 'onClose',       type: '() => void',                 default: '—',               description: 'Optional close handler (not rendered as a button — call externally).' },
  { name: 'surface',       type: '\"default\" | \"shadow-border\"', default: '\"shadow-border\"', description: 'Surface treatment — shadow-border adds the outer ring shadow.' },
  { name: 'disableMotion', type: 'boolean',                    default: 'false',           description: 'Disables slide animation, keycap press animation, and checkbox scale animation.' },
  { name: 'className',     type: 'string',                     default: '—',               description: 'Extra classes merged onto the root element.' },
];

const QUESTION_PROPS: PropRow[] = [
  { name: 'type',     type: '\"single\" | \"multi\" | \"rank\"', default: '\"single\"', description: 'Question type. Omit for single-select (backward compatible).' },
  { name: 'label',    type: 'string',                      default: '—',        description: 'Question text shown above the option list or rank items.' },
  { name: 'options',  type: 'string[]',                    default: '—',        description: 'Options for single/multi questions. Selectable by number key (1–9), ↑↓ + ↵, or click.' },
  { name: 'items',    type: 'string[]',                    default: '—',        description: 'Items for rank questions. Initial order is the default ranking.' },
  { name: 'freeText', type: 'boolean',                     default: 'false',    description: 'Single/multi only. Selecting the last option reveals an inline text input inside the option row.' },
];

const ANSWER_VARIANTS: PropRow[] = [
  { name: 'single answer', type: '{ type: \"single\"; index: number; freeText?: string }', default: '—', description: 'index is the selected option index (-1 if explicitly skipped). freeText is set when the last option is selected and freeText: true.' },
  { name: 'multi answer',  type: '{ type: \"multi\"; indices: number[]; freeText?: string }', default: '—', description: 'indices holds all selected option indices (empty if skipped). freeText as above.' },
  { name: 'rank answer',   type: '{ type: \"rank\"; order: string[] }',                    default: '—', description: 'order holds the items in their final ranked sequence.' },
  { name: 'skipped',       type: 'null',                                                  default: '—', description: 'null means the question was not answered (navigated past without selecting).' },
];

const USAGE = `import { ClarificationCardKeycap } from '@/components/ui';
import type { ClarificationQuestion } from '@/components/ui';

// Keyboard hint bar variant — shows ↑↓ ↵ ← → ⇧↵ animated keycap indicators
// Best suited for keyboard-first chat flows (e.g. ArtifactClarificationChat)
<ClarificationCardKeycap
  questions={[{
    label: 'Who is the primary user?',
    options: ['Internal team', 'External customer', 'Admin / ops', 'API consumer', 'Others'],
  }]}
  onSubmit={(answers) => console.log(answers)}
/>

// Multi-select with inline free text
<ClarificationCardKeycap
  questions={[{
    type: 'multi',
    label: 'Which constraints must we design around?',
    options: ['Mobile-first', 'Singpass login', 'Data compliance', 'No app download', 'Others'],
    freeText: true,
  }]}
  onSubmit={(answers) => console.log(answers)}
/>

// Mixed flow — single → multi → rank
const questions: ClarificationQuestion[] = [
  { type: 'single', label: 'Who is the primary user?',
    options: ['Internal team', 'External customer', 'Admin / ops', 'API consumer', 'Others'] },
  { type: 'multi',  label: 'What are the main pain points?',
    options: ['Too slow', 'Too complex', 'Missing feature', 'Unreliable', 'Others'], freeText: true },
  { type: 'rank',   label: 'Rank these goals by priority',
    items: ['Ship fast', 'High quality', 'Low cost', 'Security'] },
];

<ClarificationCardKeycap
  questions={questions}
  onSubmit={(answers) => console.log(answers)}
/>`;

export function ClarificationCardKeycapPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Clarification Card Keycap</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Q&amp;A navigator with an animated keyboard hint bar footer showing ↑↓ ↵ ← → ⇧↵
          keycap indicators that react to actual key presses. Three question types: single-select,
          multi-select, and drag-to-rank. Designed for keyboard-first chat flows.
          Setting <code>freeText: true</code> turns the last option row into an inline text input when selected.
        </p>
      </div>

      <ClarificationCardKeycapDemos />

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={CARD_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">ClarificationQuestion shape</h2>
        <PropsTable props={QUESTION_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">ClarificationAnswer variants</h2>
        <PropsTable props={ANSWER_VARIANTS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
