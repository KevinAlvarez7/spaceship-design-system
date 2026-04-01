"use client";

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';

function DefaultDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader>
          <ModalTitle>Are you absolutely sure?</ModalTitle>
          <ModalDescription>
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
}

function TitleOnlyDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Title only</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader>
          <ModalTitle>Confirm action</ModalTitle>
        </ModalHeader>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary"   onClick={() => setOpen(false)}>Confirm</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

function DestructiveDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>Delete account</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader>
          <ModalTitle>Delete account</ModalTitle>
          <ModalDescription>
            Your account and all associated data will be permanently removed.
            This action cannot be reversed.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Keep account</Button>
          <Button variant="destructive" onClick={() => setOpen(false)}>Delete</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

function NoMotionDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>No animation</Button>
      <Modal open={open} onClose={() => setOpen(false)} disableMotion>
        <ModalHeader>
          <ModalTitle>No motion modal</ModalTitle>
          <ModalDescription>
            This modal opens instantly with no scale or fade animation on the panel.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export function ModalDemos() {
  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <Preview label="With title, description, and action buttons">
          <DefaultDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Title only</h2>
        <Preview label="ModalHeader with ModalTitle, no ModalDescription">
          <TitleOnlyDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Destructive action</h2>
        <Preview label="Primary action is destructive variant">
          <DestructiveDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion disabled</h2>
        <Preview label="disableMotion — panel appears instantly">
          <NoMotionDemo />
        </Preview>
      </section>
    </>
  );
}
