import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { MeasurementFlowPage } from '@/components/docs/pages/MeasurementFlowPage';

// ─── Intent — What did the user come to do? ───────────────────────────────────

const meta = {
  title: 'Playground/Prototypes/Measurement Flow/Intent',
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

/** Homepage with a text input. User types their project idea to begin. */
export const Homepage: Story = {
  args: { initialPhase: 'homepage' },
};

/** After the user submits their first prompt, the IntentGate ClarificationCard appears. */
export const IntentGate: Story = {
  args: { initialPhase: 'intent-gate' },
};
