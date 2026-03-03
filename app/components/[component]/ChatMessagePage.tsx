import { ChatMessage } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { ChatMessageStreamingDemo } from './ChatMessageDemo';

const PROPS: PropRow[] = [
  { name: 'content',       type: 'string',  default: '—',     description: 'Markdown string to render' },
  { name: 'isStreaming',   type: 'boolean', default: 'false', description: 'Appends an animated blinking cursor while true' },
  { name: 'disableMotion', type: 'boolean', default: 'false', description: 'Renders a static cursor instead of animated' },
  { name: 'className',     type: 'string',  default: '—',     description: 'Extra classes on the wrapper div' },
];

const STATIC_MD = `I'll spin up a low-fi interface with the core screens and sample data.

**What's built:**
- Kiosk scan state
- Officer exception console
- Audit trail

Ready to start vibing! 🎨`;

const USAGE = `import { ChatMessage } from '@/components/ui';

// Static
<ChatMessage content={markdownString} />

// Streaming — update content as tokens arrive, flip isStreaming off when done
<ChatMessage content={partialContent} isStreaming={isStreaming} />`;

export function ChatMessagePage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat Message</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Assistant response block. Renders markdown and optionally shows an animated streaming cursor.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Static markdown</h2>
        <Preview label="isStreaming={false}">
          <ChatMessage content={STATIC_MD} />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Streaming simulation</h2>
        <Preview label="isStreaming={true}">
          <ChatMessageStreamingDemo />
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
