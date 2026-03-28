import { ChatBubble } from '@spaceship/design-system';
import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'children',  type: 'ReactNode', default: '—',               description: 'Message content — text or any inline elements' },
  { name: 'surface',   type: '"default" | "shadow-border"', default: '"shadow-border"', description: 'Adds shadow-border treatment to the bubble' },
  { name: 'className', type: 'string',    default: '—',               description: 'Extra classes on the bubble element' },
];

const USAGE = `import { ChatBubble } from '@spaceship/design-system';

<ChatBubble>I know my problem statement, let's build the prototype!</ChatBubble>

// Without shadow
<ChatBubble surface="default">Short reply</ChatBubble>`;

export function ChatBubblePage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat Bubble</h1>
        <p className="mt-2 text-sm text-zinc-500">
          User message bubble. Always right-aligned with brand-secondary background and a flat top-right corner.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default (shadow-border)</h2>
        <Preview label='surface="shadow-border"'>
          <ChatBubble>I know my problem statement, let&apos;s build the prototype!</ChatBubble>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Flat (no shadow)</h2>
        <Preview label='surface="default"'>
          <ChatBubble surface="default">Improve the prototype</ChatBubble>
        </Preview>
      </section>

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
