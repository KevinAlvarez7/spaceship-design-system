'use client';

import { useState } from 'react';
import { FileText, Code2, Eye, Layers, Settings } from 'lucide-react';
import { TabBar, TabBarItem } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';

function StatusDot({ color }: { color: 'success' | 'warning' }) {
  return (
    <span
      className={color === 'success' ? 'size-1.5 rounded-full shrink-0 bg-(--bg-interactive-success-default)' : 'size-1.5 rounded-full shrink-0 bg-(--bg-interactive-warning-default)'}
    />
  );
}

function BasicDemo() {
  const [tab, setTab] = useState('overview');
  return (
    <TabBar value={tab} onChange={setTab}>
      <TabBarItem value="overview">Overview</TabBarItem>
      <TabBarItem value="details">Details</TabBarItem>
      <TabBarItem value="history">History</TabBarItem>
    </TabBar>
  );
}

function WithIconsDemo() {
  const [tab, setTab] = useState('preview');
  return (
    <TabBar value={tab} onChange={setTab}>
      <TabBarItem value="preview"  leadingIcon={<Eye />}>Preview</TabBarItem>
      <TabBarItem value="code"     leadingIcon={<Code2 />}>Code</TabBarItem>
      <TabBarItem value="document" leadingIcon={<FileText />}>Docs</TabBarItem>
    </TabBar>
  );
}

function WithBadgeDemo() {
  const [tab, setTab] = useState('layers');
  return (
    <TabBar value={tab} onChange={setTab}>
      <TabBarItem value="layers"   leadingIcon={<Layers />}   badge={<StatusDot color="success" />}>Layers</TabBarItem>
      <TabBarItem value="settings" leadingIcon={<Settings />} badge={<StatusDot color="warning" />}>Settings</TabBarItem>
      <TabBarItem value="code"     leadingIcon={<Code2 />}>Code</TabBarItem>
    </TabBar>
  );
}

function SurfaceVariantsDemo() {
  const [tabA, setTabA] = useState('a1');
  const [tabB, setTabB] = useState('b1');
  return (
    <div className="flex flex-col gap-4 items-start">
      <div className="flex flex-col gap-1.5">
        <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary) [font-weight:var(--font-weight-semibold)]">surface=&quot;default&quot;</span>
        <TabBar value={tabA} onChange={setTabA} surface="default">
          <TabBarItem value="a1">One</TabBarItem>
          <TabBarItem value="a2">Two</TabBarItem>
          <TabBarItem value="a3">Three</TabBarItem>
        </TabBar>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary) [font-weight:var(--font-weight-semibold)]">surface=&quot;shadow-border&quot;</span>
        <TabBar value={tabB} onChange={setTabB} surface="shadow-border">
          <TabBarItem value="b1">One</TabBarItem>
          <TabBarItem value="b2">Two</TabBarItem>
          <TabBarItem value="b3">Three</TabBarItem>
        </TabBar>
      </div>
    </div>
  );
}

function DisabledDemo() {
  const [tab, setTab] = useState('active');
  return (
    <TabBar value={tab} onChange={setTab}>
      <TabBarItem value="active">Active</TabBarItem>
      <TabBarItem value="disabled" disabled>Disabled</TabBarItem>
      <TabBarItem value="other">Other</TabBarItem>
    </TabBar>
  );
}

function NoMotionDemo() {
  const [tab, setTab] = useState('first');
  return (
    <TabBar value={tab} onChange={setTab} disableMotion>
      <TabBarItem value="first">First</TabBarItem>
      <TabBarItem value="second">Second</TabBarItem>
      <TabBarItem value="third">Third</TabBarItem>
    </TabBar>
  );
}

export function TabBarDemos() {
  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Basic</h2>
        <Preview label="Three text tabs">
          <BasicDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With Icons</h2>
        <Preview label="leadingIcon on each tab">
          <WithIconsDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With Badge</h2>
        <Preview label="Status dot via badge prop">
          <WithBadgeDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Surface Variants</h2>
        <Preview label="default vs shadow-border">
          <SurfaceVariantsDemo />
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
        <Preview label="disableMotion — indicator snaps instantly">
          <NoMotionDemo />
        </Preview>
      </section>
    </>
  );
}
