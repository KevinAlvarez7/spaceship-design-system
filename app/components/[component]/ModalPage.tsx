import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';
import { ModalDemos } from './ModalDemos';

const PROPS: PropRow[] = [
  { name: 'open',             type: 'boolean',                         default: '—',         description: 'Controls visibility of the modal.' },
  { name: 'onClose',          type: '() => void',                      default: '—',         description: 'Called when the user clicks the backdrop or presses Escape.' },
  { name: 'surface',          type: '"default" | "shadow-border"',     default: '"default"', description: 'Surface treatment applied to the dialog panel.' },
  { name: 'disableMotion',    type: 'boolean',                         default: 'false',     description: 'Disables scale/fade animation on the dialog panel.' },
  { name: 'aria-labelledby',  type: 'string',                          default: '—',         description: 'ID of the element labelling the dialog (e.g. ModalTitle id).' },
  { name: 'aria-describedby', type: 'string',                          default: '—',         description: 'ID of the element describing the dialog (e.g. ModalDescription id).' },
  { name: 'className',        type: 'string',                          default: '—',         description: 'Extra classes merged onto the dialog panel.' },
];

const USAGE = `import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui';
import { Button } from '@/components/ui';

function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>

      <Modal open={open} onClose={() => setOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
      >
        <ModalHeader>
          <ModalTitle id="modal-title">Are you absolutely sure?</ModalTitle>
          <ModalDescription id="modal-desc">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary"   onClick={() => setOpen(false)}>Continue</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}`;

export function ModalPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Modal</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Dialog overlay for confirmations and focused actions. Closes on backdrop click or
          Escape. Locks body scroll while open.
        </p>
      </div>

      <ModalDemos />

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
