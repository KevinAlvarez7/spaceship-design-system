import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { ChatThreadDemo } from './ChatThreadDemo';

const PROPS: PropRow[] = [
  { name: 'children',  type: 'ReactNode', default: '—', description: 'ChatBubble and ChatMessage elements to render in sequence' },
  { name: 'className', type: 'string',    default: '—', description: 'Apply height constraints here (e.g. h-full, flex-1)' },
];

const USAGE = `import { ChatThread, ChatBubble, ChatMessage } from '@/components/ui';

<ChatThread className="flex-1">
  <ChatBubble>User message</ChatBubble>
  <ChatMessage content="Assistant reply with **markdown**." />
  <ChatBubble>Another user message</ChatBubble>
  <ChatMessage content={streamingContent} isStreaming={isStreaming} />
</ChatThread>`;

export function ChatThreadPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat Thread</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Scrollable message container. Automatically scrolls to the bottom when new messages are added.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Interactive demo</h2>
        <Preview label="type a message and press Enter">
          <ChatThreadDemo />
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
