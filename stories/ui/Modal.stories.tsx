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
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ModalDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
