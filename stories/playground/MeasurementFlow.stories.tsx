import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { MeasurementFlowPage } from '@/components/docs/pages/MeasurementFlowPage';

// ─── Meta ─────────────────────────────────────────────────────────────────────
//
// Full-page prototype integrating all 5 measurement patterns — IntentGate,
// QualityGate, AcknowledgementGate, ResolutionPrompt, and PostSessionNudge —
// into a single branching flow with 3 intent paths:
//
//   • tender  — Refine and test idea for project tender (Citizen Grants Portal)
//   • explore — Explore ideas (Student Wellbeing Early Warning)
//   • build   — Build low-risk mini-app for myself/team (Branch Renovation Tracker)
//
// Each named story jumps directly to a specific phase. Play through the flow
// from any entry point — it's fully interactive.

const meta = {
  title: 'Playground/Prototypes/Measurement Flow',
  component: MeasurementFlowPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Measurement patterns prototype. Integrates IntentGate, QualityGate, AcknowledgementGate, ResolutionPrompt, and PostSessionNudge into a branching 3-path flow.',
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
      options: [
        'homepage', 'intent-gate', 'clarify-1', 'clarify-2',
        'quality-gate', 'impl-questions', 'ack-gate',
        'building', 'resolution', 'nudge', 'done',
      ],
      table: { category: 'Phase' },
    },
    initialPath: {
      control: { type: 'select' },
      options: ['tender', 'explore', 'build'],
      table: { category: 'Phase' },
    },
  },
} satisfies Meta<typeof MeasurementFlowPage>;

export default meta;
type Story = StoryObj<typeof MeasurementFlowPage>;

// ─── Entry point — Homepage ───────────────────────────────────────────────────
// Homepage with a text input. User types their project idea to begin.

export const Homepage: Story = {
  args: { initialPhase: 'homepage' },
};

// ─── IntentGate ───────────────────────────────────────────────────────────────
// After the user submits their first prompt, the assistant responds and shows
// the IntentGate ClarificationCard (weight="prominent") in the chat footer.

export const IntentGate: Story = {
  args: { initialPhase: 'intent-gate' },
};

// ─── Path: Tender — Citizen Grants Portal ────────────────────────────────────

/** Problem clarification for the tender path. */
export const TenderClarification: Story = {
  args: { initialPhase: 'clarify-1', initialPath: 'tender' },
};

/** QualityGate after the Project Brief is generated. */
export const TenderQualityGate: Story = {
  args: { initialPhase: 'quality-gate', initialPath: 'tender' },
};

/** AcknowledgementGate — PDPA and data governance sign-off. */
export const TenderAcknowledgementGate: Story = {
  args: { initialPhase: 'ack-gate', initialPath: 'tender' },
};

// ─── Path: Explore — Student Wellbeing Early Warning ─────────────────────────

/** Problem exploration for the explore path. */
export const ExploreClarification: Story = {
  args: { initialPhase: 'clarify-1', initialPath: 'explore' },
};

/** QualityGate after the Exploration Brief is generated. */
export const ExploreQualityGate: Story = {
  args: { initialPhase: 'quality-gate', initialPath: 'explore' },
};

/** AcknowledgementGate — ethical review and synthetic-data commitment. */
export const ExploreAcknowledgementGate: Story = {
  args: { initialPhase: 'ack-gate', initialPath: 'explore' },
};

// ─── Path: Build — Branch Renovation Tracker ─────────────────────────────────

/** Requirements clarification for the build path. */
export const BuildClarification: Story = {
  args: { initialPhase: 'clarify-1', initialPath: 'build' },
};

/** QualityGate after the Requirements Brief is generated. */
export const BuildQualityGate: Story = {
  args: { initialPhase: 'quality-gate', initialPath: 'build' },
};

/** AcknowledgementGate — low-risk data handling confirmation. */
export const BuildAcknowledgementGate: Story = {
  args: { initialPhase: 'ack-gate', initialPath: 'build' },
};

// ─── Shared end-of-flow ───────────────────────────────────────────────────────

/** Live task ticker — each build task completes every 2 s. */
export const Building: Story = {
  args: { initialPhase: 'building', initialPath: 'tender' },
};

/** ResolutionPrompt — "Do you have enough to present this?" */
export const ResolutionPrompt: Story = {
  args: { initialPhase: 'resolution', initialPath: 'tender' },
};

/** PostSessionNudge — "How did it go with Spaceship?" */
export const PostSessionNudge: Story = {
  args: { initialPhase: 'nudge', initialPath: 'tender' },
};
