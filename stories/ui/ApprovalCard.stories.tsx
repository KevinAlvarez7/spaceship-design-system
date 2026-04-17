import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ApprovalCard } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const PLAN_CONTENT = `**Phase 1: Database schema**
- Create users, projects, and tasks tables
- Add foreign key relationships
- Write migration scripts

**Phase 2: API layer**
- Build REST endpoints with validation
- Add authentication middleware
- Write integration tests

**Phase 3: Frontend**
- Implement React components
- Connect to API
- Add loading and error states`;

const meta = {
  title: 'Components/ApprovalCard',
  component: ApprovalCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Approve/reject decision card for gating AI-generated plans before execution.' } },
  },
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    approveLabel:  { control: 'text' },
    rejectLabel:   { control: 'text' },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    children:      { table: { disable: true } },
    onApprove:     { table: { disable: true } },
    onReject:      { table: { disable: true } },
  },
  args: {
    surface: 'shadow-border',
    approveLabel: 'Approve plan',
    rejectLabel: 'Request changes',
    disableMotion: false,
  },
  render: (args) => (
    <div className="w-(--sizing-chat-default)">
      <ApprovalCard {...args}>
        <div className="prose prose-sm max-w-none">
          <p className="text-sm whitespace-pre-line">{PLAN_CONTENT}</p>
        </div>
      </ApprovalCard>
    </div>
  ),
} satisfies Meta<typeof ApprovalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'ApprovalCard', padding: '—',         gap: 'gap-4',  radius: '—',          note: 'outer flex column' },
  { part: 'Card shell',   padding: '—',          gap: '—',      radius: 'rounded-lg', note: 'resizable card with overflow-hidden' },
  { part: 'Drag handle',  padding: 'py-2',       gap: '—',      radius: '—' },
  { part: 'Header',       padding: 'px-3 py-2',  gap: '—',      radius: '—' },
  { part: 'Content area', padding: 'p-4',        gap: '—',      radius: '—',          note: 'scrollable viewport' },
  { part: 'Action row',   padding: 'px-3 py-3',  gap: '—',      radius: 'rounded',    note: 'approve / reject buttons' },
  { part: 'Reject form',  padding: 'p-3',        gap: 'gap-3',  radius: 'rounded',    note: 'request changes expanded state' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/approval-card.tsx"
      preview={
        <div className="w-(--sizing-chat-default)">
          <ApprovalCard approveLabel="Approve plan" rejectLabel="Request changes" disableMotion>
            <p className="text-sm">Review this plan before proceeding.</p>
          </ApprovalCard>
        </div>
      }
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};

export const CustomLabels: Story = {
  args: {
    approveLabel: 'Looks good, proceed',
    rejectLabel: 'Needs revision',
  },
};

export const DefaultSurface: Story = {
  args: { surface: 'default' },
};

// ─── Measurement pattern stories ─────────────────────────────────────────────

/** ApprovalCard configured as a security / acknowledgement gate. */
export const AcknowledgementGate: Story = {
  args: {
    title: 'Security Review',
    approveLabel: 'Yes, I accept and will proceed',
    rejectLabel: 'I need to check with my team first',
  },
  render: (args) => (
    <div className="w-(--sizing-chat-default)">
      <ApprovalCard {...args}>
        <p className="[font-size:var(--font-size-sm)] text-(--text-primary)">
          Do you understand and accept the security risks outlined above?
        </p>
      </ApprovalCard>
    </div>
  ),
};

/** ApprovalCard configured as a quality signal gate inline below an AI artifact. */
export const QualityGate: Story = {
  args: {
    title: 'Quality Check',
    approveLabel: 'Yes, looks right',
    rejectLabel: 'Needs changes',
  },
  render: (args) => (
    <div className="w-(--sizing-chat-default)">
      <ApprovalCard {...args}>
        <p className="[font-size:var(--font-size-sm)] text-(--text-primary)">
          Does this brief capture what you had in mind?
        </p>
      </ApprovalCard>
    </div>
  ),
};

/** ApprovalCard configured as a resolution prompt at session close or prototype reveal. */
export const ResolutionPrompt: Story = {
  args: {
    title: 'Resolution Check',
    approveLabel: 'Yes, ready to present',
    rejectLabel: 'Not quite there yet',
  },
  render: (args) => (
    <div className="w-(--sizing-chat-default)">
      <ApprovalCard {...args}>
        <p className="[font-size:var(--font-size-sm)] text-(--text-primary)">
          Do you have enough to make a decision or present this?
        </p>
      </ApprovalCard>
    </div>
  ),
};

