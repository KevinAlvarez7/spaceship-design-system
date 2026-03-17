'use client';

import { useState } from 'react';
import { FileText, Code2, Eye, Search, GitBranch, RefreshCw, ExternalLink, Settings, Download } from 'lucide-react';
import { FolderTabs, FolderTab, Button } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';

function BasicDemo() {
  const [tab, setTab] = useState('overview');
  return (
    <FolderTabs value={tab} onChange={setTab}>
      <FolderTab value="overview">Overview</FolderTab>
      <FolderTab value="details">Details</FolderTab>
      <FolderTab value="history">History</FolderTab>
    </FolderTabs>
  );
}

function WithIconsDemo() {
  const [tab, setTab] = useState('preview');
  return (
    <FolderTabs value={tab} onChange={setTab}>
      <FolderTab value="preview"  leadingIcon={<Eye />}>Preview</FolderTab>
      <FolderTab value="code"     leadingIcon={<Code2 />}>Code</FolderTab>
      <FolderTab value="document" leadingIcon={<FileText />}>Docs</FolderTab>
    </FolderTabs>
  );
}

function WithActionsDemo() {
  const [tab, setTab] = useState('research');
  return (
    <FolderTabs
      value={tab}
      onChange={setTab}
      activeActions={
        <>
          <Button variant="secondary" size="sm" surface="shadow" leadingIcon={<RefreshCw />}>Refresh</Button>
          <Button variant="primary" size="sm" surface="shadow" leadingIcon={<ExternalLink />}>Open</Button>
        </>
      }
    >
      <FolderTab value="prd"            leadingIcon={<FileText />}>PRD</FolderTab>
      <FolderTab value="research"       leadingIcon={<Search />}>Research</FolderTab>
      <FolderTab value="implementation" leadingIcon={<GitBranch />}>Implementation</FolderTab>
    </FolderTabs>
  );
}

function PerTabActionsDemo() {
  const [tab, setTab] = useState('code');

  const actions: Record<string, React.ReactNode> = {
    code:    <><Button variant="secondary" size="sm" surface="shadow" leadingIcon={<Settings />}>Options</Button><Button variant="primary" size="sm" surface="shadow" leadingIcon={<Download />}>Download</Button></>,
    preview: <><Button variant="secondary" size="sm" surface="shadow" leadingIcon={<Settings />}>Options</Button><Button variant="primary" size="sm" surface="shadow" leadingIcon={<ExternalLink />}>Open</Button></>,
    docs:    <><Button variant="secondary" size="sm" surface="shadow" leadingIcon={<Settings />}>Options</Button><Button variant="primary" size="sm" surface="shadow" leadingIcon={<ExternalLink />}>View</Button></>,
  };

  return (
    <FolderTabs value={tab} onChange={setTab} activeActions={actions[tab]}>
      <FolderTab value="code"    leadingIcon={<Code2 />}>Code</FolderTab>
      <FolderTab value="preview" leadingIcon={<Eye />}>Preview</FolderTab>
      <FolderTab value="docs"    leadingIcon={<FileText />}>Docs</FolderTab>
    </FolderTabs>
  );
}

function DisabledDemo() {
  const [tab, setTab] = useState('active');
  return (
    <FolderTabs value={tab} onChange={setTab}>
      <FolderTab value="active">Active</FolderTab>
      <FolderTab value="disabled" disabled>Disabled</FolderTab>
      <FolderTab value="other">Other</FolderTab>
    </FolderTabs>
  );
}

function NoMotionDemo() {
  const [tab, setTab] = useState('first');
  return (
    <FolderTabs value={tab} onChange={setTab} disableMotion>
      <FolderTab value="first"  leadingIcon={<FileText />}>First</FolderTab>
      <FolderTab value="second" leadingIcon={<Code2 />}>Second</FolderTab>
      <FolderTab value="third"  leadingIcon={<Eye />}>Third</FolderTab>
    </FolderTabs>
  );
}

export function FolderTabsDemos() {
  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Basic</h2>
        <Preview label="Active tab expands to fill width; inactive tabs shrink to content">
          <BasicDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With Icons</h2>
        <Preview label="leadingIcon visible on all tabs">
          <WithIconsDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With Actions</h2>
        <Preview label="activeActions on FolderTabs — rendered inline in the active tab">
          <WithActionsDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Per-Tab Actions</h2>
        <Preview label="Different actions per tab via activeActions={actions[tab]}">
          <PerTabActionsDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled State</h2>
        <Preview label="disabled tab — not clickable, reduced opacity">
          <DisabledDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion Disabled</h2>
        <Preview label="disableMotion — active tab snaps instantly">
          <NoMotionDemo />
        </Preview>
      </section>
    </>
  );
}
