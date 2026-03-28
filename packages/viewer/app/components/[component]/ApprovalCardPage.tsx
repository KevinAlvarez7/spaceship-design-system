import { ApprovalCardDemos } from './ApprovalCardDemos';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'children',      type: 'React.ReactNode', default: '—',            description: 'Content rendered in the scrollable document container (typically rendered markdown)' },
  { name: 'onApprove',     type: '() => void',      default: '—',            description: 'Called when the user clicks the approve button' },
  { name: 'onReject',      type: '() => void',      default: '—',            description: 'Called when the user clicks the reject button' },
  { name: 'approveLabel',  type: 'string',           default: '"Approve plan"',    description: 'Label for the approve action button' },
  { name: 'rejectLabel',   type: 'string',           default: '"Request changes"', description: 'Label for the reject action button' },
  { name: 'surface',       type: '"default" | "shadow-border"', default: '"shadow-border"', description: 'Visual treatment applied to both containers' },
  { name: 'disableMotion', type: 'boolean',          default: 'false',        description: 'Disables motion animations' },
  { name: 'className',     type: 'string',           default: '—',            description: 'Additional classes applied to the outer wrapper' },
];

const USAGE = `import ReactMarkdown from 'react-markdown';
import { ApprovalCard } from '@spaceship/design-system';

const content = \`## Implementation Plan
...
\`;

<ApprovalCard
  onApprove={() => console.log('approved')}
  onReject={() => console.log('rejected')}
>
  <div className="flex flex-col w-full">
    <ReactMarkdown>{content}</ReactMarkdown>
  </div>
</ApprovalCard>`;

export function ApprovalCardPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Approval Card</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Two-container layout: a scrollable markdown document on top and a separate approve / reject
          action bar below. Designed for use as a bottom-sheet overlay in ChatPanel.
        </p>
      </div>

      <ApprovalCardDemos />

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
