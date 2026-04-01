import { ApprovalCardDemos } from './ApprovalCardDemos';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'children',      type: 'React.ReactNode', default: '—',                       description: 'Content rendered in the scrollable document container (typically rendered markdown)' },
  { name: 'title',         type: 'string',           default: '"Implementation Plan"',   description: 'Title displayed in the header bar' },
  { name: 'onApprove',     type: '() => void',       default: '—',                       description: 'Called when the user clicks the Approve Plan row' },
  { name: 'onReject',      type: '(message?: string) => void', default: '—',            description: 'Called when the user submits the Request Changes form; receives the optional message text' },
  { name: 'approveLabel',  type: 'string',           default: '"Approve Plan"',          description: 'Label for the approve action row' },
  { name: 'rejectLabel',   type: 'string',           default: '"Request Changes"',       description: 'Label for the request-changes action row' },
  { name: 'surface',       type: '"default" | "shadow-border"', default: '"shadow-border"', description: 'Applies shadow-border to the card and action rows when set' },
  { name: 'disableMotion', type: 'boolean',          default: 'false',                   description: 'Disables motion animations' },
  { name: 'className',     type: 'string',           default: '—',                       description: 'Additional classes applied to the outer wrapper' },
];

const USAGE = `import ReactMarkdown from 'react-markdown';
import { ApprovalCard } from '@/components/ui';

const content = \`## Implementation Plan
...
\`;

<ApprovalCard
  title="Implementation Plan"
  onApprove={() => console.log('approved')}
  onReject={(message) => console.log('changes requested:', message)}
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
          Drag-to-resize card with a header, scrollable content, and two full-width action rows —
          Approve Plan and Request Changes. The Request Changes row expands into an inline text input
          so the user can explain what they want before submitting. Designed for use as a bottom-sheet
          overlay in ChatPanel.
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
