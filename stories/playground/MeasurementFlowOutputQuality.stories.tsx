import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { MeasurementFlowPage } from '@/components/docs/pages/MeasurementFlowPage';

// ─── Output Quality — Did the AI artifacts match what they expected? ───────────

const meta = {
  title: 'Playground/Prototypes/Measurement Flow/Output Quality',
  component: MeasurementFlowPage,
  parameters: { layout: 'fullscreen' },
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
