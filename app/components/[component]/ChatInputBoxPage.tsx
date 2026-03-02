'use client';

import { useState } from 'react';
import { ChatInputBox } from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'surface',      type: '"professional" | "neo-brutalist"', default: '"professional"', description: 'Surface treatment — controls container and button styling' },
  { name: 'submitLabel',  type: 'string',   default: '"Explore"',  description: 'Text label on the submit button' },
  { name: 'placeholder',  type: 'string',   default: '"Explore any problems..."', description: 'Textarea placeholder text' },
  { name: 'value',        type: 'string',   default: '—',          description: 'Controlled textarea value' },
  { name: 'onChange',     type: '(e) => void', default: '—',       description: 'Textarea change handler' },
  { name: 'onSubmit',     type: '(value: string) => void', default: '—', description: 'Called on button click or Cmd/Ctrl+Enter' },
  { name: 'disabled',     type: 'boolean',  default: 'false',      description: 'Disables textarea and button' },
  { name: 'containerClassName', type: 'string', default: '—',      description: 'Extra classes on the container div' },
];

const USAGE = `import { ChatInputBox } from '@/components/ui';

// Professional
<ChatInputBox
  surface="professional"
  value={value}
  onChange={e => setValue(e.target.value)}
  onSubmit={val => console.log(val)}
/>

// Neo-brutalist
<ChatInputBox
  surface="neo-brutalist"
  value={value}
  onChange={e => setValue(e.target.value)}
  onSubmit={val => console.log(val)}
/>`;

function ControlledDemo({ surface }: { surface: 'professional' | 'neo-brutalist' }) {
  const [value, setValue] = useState('');
  return (
    <ChatInputBox
      surface={surface}
      value={value}
      onChange={e => setValue(e.target.value)}
      onSubmit={val => console.log('submit:', val)}
      className="w-full max-w-lg"
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
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Professional</h2>
        <Preview label='surface="professional"'>
          <ControlledDemo surface="professional" />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Neo-brutalist</h2>
        <Preview label='surface="neo-brutalist"'>
          <ControlledDemo surface="neo-brutalist" />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled</h2>
        <Preview label="disabled">
          <ChatInputBox surface="professional" disabled placeholder="Disabled state" className="w-full max-w-lg" />
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
