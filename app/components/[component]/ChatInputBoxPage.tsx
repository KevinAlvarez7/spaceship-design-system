'use client';

import { useState } from 'react';
import { ChatInputBox } from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'surface',      type: '"default" | "shadow"', default: '"shadow"', description: 'Surface treatment — controls container and button styling' },
  { name: 'submitLabel',  type: 'string',   default: '"Explore"',  description: 'Text label on the submit button' },
  { name: 'placeholder',  type: 'string',   default: '"Explore any problems, prototype any ideas..."', description: 'Textarea placeholder text' },
  { name: 'value',        type: 'string',   default: '—',          description: 'Controlled textarea value' },
  { name: 'onChange',     type: '(e: React.ChangeEvent<HTMLTextAreaElement>) => void', default: '—', description: 'Textarea change handler' },
  { name: 'className',    type: 'string',   default: '—',          description: 'Extra classes applied to the textarea element' },
  { name: 'onSubmit',     type: '(value: string) => void', default: '—', description: 'Called on button click or Cmd/Ctrl+Enter' },
  { name: 'disabled',     type: 'boolean',  default: 'false',      description: 'Disables textarea and button' },
  { name: 'containerClassName', type: 'string', default: '—',      description: 'Extra classes on the container div' },
];

const USAGE = `import { ChatInputBox } from '@/components/ui';

// Shadow surface
<ChatInputBox
  surface="shadow"
  value={value}
  onChange={e => setValue(e.target.value)}
  onSubmit={val => console.log(val)}
/>

// Default surface
<ChatInputBox
  surface="default"
  value={value}
  onChange={e => setValue(e.target.value)}
  onSubmit={val => console.log(val)}
/>`;

function ControlledDemo({ surface }: { surface: 'default' | 'shadow' }) {
  const [value, setValue] = useState('');
  return (
    <ChatInputBox
      surface={surface}
      value={value}
      onChange={e => setValue(e.target.value)}
      onSubmit={val => console.log('submit:', val)}
      containerClassName="w-full max-w-lg"
    />
  );
}

export function ChatInputBoxPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat Input Box</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Multiline text input with a submit button. Two surface treatments for design experimentation.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Shadow</h2>
        <Preview label='surface="shadow"'>
          <ControlledDemo surface="shadow" />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <Preview label='surface="default"'>
          <ControlledDemo surface="default" />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled</h2>
        <Preview label="disabled">
          <ChatInputBox surface="shadow" disabled placeholder="Disabled state" containerClassName="w-full max-w-lg" />
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
