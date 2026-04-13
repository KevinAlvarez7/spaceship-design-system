import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

function ModalDemo({ surface }: { surface?: 'default' | 'shadow-border' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} surface={surface}>
        <ModalHeader>
          <ModalTitle>Delete project?</ModalTitle>
          <ModalDescription>
            This will permanently delete the project and all its data. This action cannot be undone.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => setOpen(false)}>Delete</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

const meta = {
  title: 'Components/Modal',
  component: ModalDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Portal-based dialog with backdrop, Escape-to-close, body scroll lock, and spring-animated entry.' } },
  },
} satisfies Meta<typeof ModalDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'Modal',       padding: 'p-3', gap: 'gap-8', radius: 'rounded-lg' },
  { part: 'ModalHeader', padding: 'p-1', gap: 'gap-2', radius: '—' },
  { part: 'ModalFooter', padding: '—',   gap: 'gap-3', radius: '—' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/modal.tsx"
      preview={
        <Modal open disableMotion>
          <ModalHeader>
            <ModalTitle>Delete project?</ModalTitle>
            <ModalDescription>This action cannot be undone.</ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="secondary" disableMotion>Cancel</Button>
            <Button variant="destructive" disableMotion>Delete</Button>
          </ModalFooter>
        </Modal>
      }
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};

export const WithLongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalHeader>
            <ModalTitle>Terms of Service</ModalTitle>
            <ModalDescription>Please read before continuing.</ModalDescription>
          </ModalHeader>
          <div className="px-1 space-y-3 text-sm text-zinc-600 overflow-y-auto max-h-64">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Decline</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Accept</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

