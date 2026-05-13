import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { EvidenceStudioPage } from '@/components/docs/pages/EvidenceStudioPage';

// ─── Meta ─────────────────────────────────────────────────────────────────────
//
// Evidence Studio — mid-gate validation prototype. Officer has a hypothesis and
// uses this to plan validation methods, launch a citizen survey, and watch
// evidence land. Outputs: a Validation Plan and an Evidence Log.

const meta = {
  title: 'Playground/Prototypes/Evidence Studio',
  component: EvidenceStudioPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Mid-gate validation prototype: pick validation methods → plan + tasks → launch citizen survey → evidence log.',
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
      options: ['homepage', 'pick-methods', 'plan-tasks', 'citizen-survey', 'evidence-landing', 'evidence-log'],
      table: { category: 'Phase' },
    },
  },
} satisfies Meta<typeof EvidenceStudioPage>;

export default meta;
type Story = StoryObj<typeof EvidenceStudioPage>;

// ─── Homepage ─────────────────────────────────────────────────────────────────
export const Homepage: Story = { args: { initialPhase: 'homepage' } };

// ─── Pick Methods ─────────────────────────────────────────────────────────────
// Multi-select clarification card — choose validation methods and falsifiers.
export const PickMethods: Story = { args: { initialPhase: 'pick-methods' } };

// ─── Plan + Tasks ─────────────────────────────────────────────────────────────
// Plan artifact opens; live TaskList in chat; "Launch citizen survey" button ready.
export const PlanTasks: Story = { args: { initialPhase: 'plan-tasks' } };

// ─── Citizen Survey ───────────────────────────────────────────────────────────
// Standalone citizen-facing survey scene. Also reachable from officer view
// via the "Citizen view" button (opens in a Modal).
export const CitizenSurvey: Story = { args: { initialPhase: 'citizen-survey' } };

// ─── Evidence Landing ─────────────────────────────────────────────────────────
// Evidence ticker — quote cards appear as citizen responses land in real time.
export const EvidenceLanding: Story = { args: { initialPhase: 'evidence-landing' } };

// ─── Evidence Log ─────────────────────────────────────────────────────────────
// All evidence in, log artifact compiled, summary message rendered.
export const EvidenceLog: Story = { args: { initialPhase: 'evidence-log' } };
