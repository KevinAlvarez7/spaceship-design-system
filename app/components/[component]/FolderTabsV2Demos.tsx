'use client';

import { useState } from 'react';
import { FileText, Monitor, Code2, Eye, Shield } from 'lucide-react';
import { FolderTabsV2, FolderTabV2 } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';

function BrowserTabsDemo() {
  const [tab, setTab] = useState('prototype');
  return (
    <FolderTabsV2
      value={tab}
      onChange={setTab}
      surface="shadow-border"
    >
      <FolderTabV2 value="brief"     leadingIcon={<FileText />}>Product Brief</FolderTabV2>
      <FolderTabV2 value="prototype" leadingIcon={<Monitor />}>Prototype</FolderTabV2>
      <FolderTabV2 value="risks"     leadingIcon={<FileText />}>Security Risks</FolderTabV2>
    </FolderTabsV2>
  );
}

function BasicDemo() {
  const [tab, setTab] = useState('preview');
  return (
    <FolderTabsV2 value={tab} onChange={setTab}>
      <FolderTabV2 value="preview" leadingIcon={<Eye />}>Preview</FolderTabV2>
      <FolderTabV2 value="code"    leadingIcon={<Code2 />}>Code</FolderTabV2>
      <FolderTabV2 value="docs"    leadingIcon={<FileText />}>Docs</FolderTabV2>
    </FolderTabsV2>
  );
}

function NoLeadingActionDemo() {
  const [tab, setTab] = useState('files');
  return (
    <FolderTabsV2 value={tab} onChange={setTab} surface="shadow-border">
      <FolderTabV2 value="files"    leadingIcon={<FileText />}>Files</FolderTabV2>
      <FolderTabV2 value="security" leadingIcon={<Shield />}>Security</FolderTabV2>
      <FolderTabV2 value="preview"  leadingIcon={<Eye />}>Preview</FolderTabV2>
    </FolderTabsV2>
  );
}

function SurfaceVariantsDemo() {
  const [tabA, setTabA] = useState('a1');
  const [tabB, setTabB] = useState('b1');
  return (
    <div className="flex flex-col gap-4 items-start">
      <div className="flex flex-col gap-1.5">
        <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary) [font-weight:var(--font-weight-semibold)]">surface=&quot;default&quot;</span>
        <FolderTabsV2 value={tabA} onChange={setTabA} surface="default">
          <FolderTabV2 value="a1" leadingIcon={<Eye />}>Preview</FolderTabV2>
          <FolderTabV2 value="a2" leadingIcon={<Code2 />}>Code</FolderTabV2>
          <FolderTabV2 value="a3" leadingIcon={<FileText />}>Docs</FolderTabV2>
        </FolderTabsV2>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary) [font-weight:var(--font-weight-semibold)]">surface=&quot;shadow-border&quot;</span>
        <FolderTabsV2 value={tabB} onChange={setTabB} surface="shadow-border">
          <FolderTabV2 value="b1" leadingIcon={<Eye />}>Preview</FolderTabV2>
          <FolderTabV2 value="b2" leadingIcon={<Code2 />}>Code</FolderTabV2>
          <FolderTabV2 value="b3" leadingIcon={<FileText />}>Docs</FolderTabV2>
        </FolderTabsV2>
      </div>
    </div>
  );
}

function DisabledDemo() {
  const [tab, setTab] = useState('preview');
  return (
    <FolderTabsV2 value={tab} onChange={setTab} surface="shadow-border">
      <FolderTabV2 value="preview"  leadingIcon={<Eye />}>Preview</FolderTabV2>
      <FolderTabV2 value="code"     leadingIcon={<Code2 />} disabled>Code</FolderTabV2>
      <FolderTabV2 value="docs"     leadingIcon={<FileText />}>Docs</FolderTabV2>
    </FolderTabsV2>
  );
}

function NoMotionDemo() {
  const [tab, setTab] = useState('preview');
  return (
    <FolderTabsV2 value={tab} onChange={setTab} surface="shadow-border" disableMotion>
      <FolderTabV2 value="preview" leadingIcon={<Eye />}>Preview</FolderTabV2>
      <FolderTabV2 value="code"    leadingIcon={<Code2 />}>Code</FolderTabV2>
      <FolderTabV2 value="docs"    leadingIcon={<FileText />}>Docs</FolderTabV2>
    </FolderTabsV2>
  );
}

export function FolderTabsV2Demos() {
  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Browser tabs</h2>
        <Preview label="shadow-border surface — active tab connects to content card below">
          <BrowserTabsDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Basic</h2>
        <Preview label="Icon-label tabs, no leading action">
          <BasicDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Without leading action</h2>
        <Preview label="shadow-border surface, tabs only">
          <NoLeadingActionDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Surface variants</h2>
        <Preview label="default vs shadow-border">
          <SurfaceVariantsDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled tab</h2>
        <Preview label="disabled — not clickable, reduced opacity">
          <DisabledDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion disabled</h2>
        <Preview label="disableMotion — indicator snaps instantly">
          <NoMotionDemo />
        </Preview>
      </section>
    </>
  );
}
