import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { HypothesisLabPage } from '@/components/docs/pages/HypothesisLabPage';

// ─── Meta ─────────────────────────────────────────────────────────────────────
//
// Hypothesis Lab — early-gate validation prototype. Walks an officer from a
// rough idea through structured framing (who → problem + assumption →
// falsifier → brief). Output: a single Hypothesis Brief artifact ready to take
// into EvidenceStudio.
//
// Citizen-side: the "Citizen view" button in the chat header opens a Modal
// showing the public submission card; the same card is also available as the
// `CitizenSubmit` story export for deep-linking.

const meta = {
  title: 'Playground/Prototypes/Hypothesis Lab',
  component: HypothesisLabPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Early-gate validation prototype: structured framing of who / problem / assumption / falsifier. Produces a Hypothesis Brief.',
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
      options: ['homepage', 'citizen-submit', 'frame-who', 'frame-problem-assumption', 'frame-falsify', 'brief'],
      table: { category: 'Phase' },
    },
  },
} satisfies Meta<typeof HypothesisLabPage>;

export default meta;
type Story = StoryObj<typeof HypothesisLabPage>;

// ─── Homepage ─────────────────────────────────────────────────────────────────
// Hero — drop a rough idea to begin framing.

export const Homepage: Story = {
  args: { initialPhase: 'homepage' },
};

// ─── Citizen Submit ───────────────────────────────────────────────────────────
// Citizen-facing "share your experience" submission view. Reachable from
// officer view via the "Citizen view" button; also available standalone.

export const CitizenSubmit: Story = {
  args: { initialPhase: 'citizen-submit' },
};

// ─── Frame: Who ───────────────────────────────────────────────────────────────
// First framing step — pick the affected citizen segment and the signals.

export const FrameWho: Story = {
  args: { initialPhase: 'frame-who' },
};

// ─── Frame: Problem + Assumption ──────────────────────────────────────────────
// Second framing step — the specific problem and the biggest assumption.

export const FrameProblemAssumption: Story = {
  args: { initialPhase: 'frame-problem-assumption' },
};

// ─── Frame: Falsifier ─────────────────────────────────────────────────────────
// Final framing step — how would we know we're wrong?

export const FrameFalsifier: Story = {
  args: { initialPhase: 'frame-falsify' },
};

// ─── Brief ────────────────────────────────────────────────────────────────────
// Hypothesis Brief generated and rendered in the artifact panel.

export const Brief: Story = {
  args: { initialPhase: 'brief' },
};
