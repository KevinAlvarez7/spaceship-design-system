import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { ReadinessGatePage } from '@/components/docs/pages/ReadinessGatePage';

// ─── Meta ─────────────────────────────────────────────────────────────────────
//
// Readiness Gate — late-gate validation prototype. Officer walks through each
// load-bearing assumption and marks it validated / partial / unvalidated. The
// output is a per-assumption table with a summary Tag — no invented numeric
// score. Citizens appear as an impact preview before the gate decision.

const meta = {
  title: 'Playground/Prototypes/Readiness Gate',
  component: ReadinessGatePage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Late-gate validation prototype: per-assumption scoring + citizen impact preview + approve/reject. No invented numeric score.',
      },
    },
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        {process.env.NODE_ENV === 'development' && <InterfaceKit />}
      </>
    ),
    (Story) => (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    initialPhase: {
      control: { type: 'select' },
      options: ['homepage', 'checklist', 'score-pending', 'citizen-impact-preview', 'gate-decision', 'gate-approved', 'gate-blocked'],
      table: { category: 'Phase' },
    },
    blocked: {
      control: { type: 'boolean' },
      table: { category: 'Data', defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof ReadinessGatePage>;

export default meta;
type Story = StoryObj<typeof ReadinessGatePage>;

// ─── Homepage ─────────────────────────────────────────────────────────────────
export const Homepage: Story = { args: { initialPhase: 'homepage' } };

// ─── Checklist ────────────────────────────────────────────────────────────────
// Sequential ClarificationCards — mark each assumption.
export const Checklist: Story = { args: { initialPhase: 'checklist' } };

// ─── Score Pending ────────────────────────────────────────────────────────────
// ThinkingSaucer indicator while the readiness assessment compiles.
export const ScorePending: Story = { args: { initialPhase: 'score-pending' } };

// ─── Citizen Impact Preview ───────────────────────────────────────────────────
// Predicted impact per persona before the gate decision. Reachable via the
// "Citizen view" button; this story shows the page state with the modal-ready
// CTA.
export const CitizenImpactPreview: Story = { args: { initialPhase: 'citizen-impact-preview' } };

// ─── Gate Decision ────────────────────────────────────────────────────────────
// Approval card overlay — approve or request changes.
export const GateDecision: Story = { args: { initialPhase: 'gate-decision' } };

// ─── Gate Approved ────────────────────────────────────────────────────────────
// Readiness report locked into the artifact panel.
export const GateApproved: Story = { args: { initialPhase: 'gate-approved' } };

// ─── Gate Blocked ─────────────────────────────────────────────────────────────
// Blocked path — surfaces unvalidated assumptions to take back into EvidenceStudio.
export const GateBlocked: Story = {
  args: { initialPhase: 'gate-blocked', blocked: true },
};
