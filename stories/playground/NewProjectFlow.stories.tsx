import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { NewProjectFlowPage } from '@/components/docs/pages/NewProjectFlowPage';

// ─── Meta ─────────────────────────────────────────────────────────────────────
//
// Full-page prototype: multi-step clarification chat that walks from a homepage
// hero through problem/solution clarification, implementation approval, and a
// live build task list. Each story starts at a specific phase so you can jump
// directly to any part of the flow without waiting through earlier steps.
//
// Interact with the story — it's fully live. Type a message, answer the
// clarification cards, approve/reject the plan, then watch the task ticker run.

const meta = {
  title: 'Playground/Prototypes/New Project Flow',
  component: NewProjectFlowPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Multi-step AI clarification chat prototype. Walks through: homepage → problem clarification → solution clarification → gate → implementation questions → plan approval → live build → done.',
      },
    },
  },
  // Provides an explicit flex-col h-screen context so `flex-1` in the page
  // component resolves to the full viewport height inside Storybook's iframe.
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
      options: ['homepage', 'step1', 'step2', 'gate', 'impl-questions', 'approval', 'building', 'done'],
      table: { category: 'Phase' },
    },
  },
} satisfies Meta<typeof NewProjectFlowPage>;

export default meta;
type Story = StoryObj<typeof NewProjectFlowPage>;

// ─── Homepage ─────────────────────────────────────────────────────────────────
// Entry point — hero with logo scene, headline, and input.
// Type any message to begin the flow.

export const Homepage: Story = {
  args: { initialPhase: 'homepage' },
};

// ─── Step 1 — Problem Clarification ──────────────────────────────────────────
// First clarification card appears in the chat footer.

export const ProblemClarification: Story = {
  args: { initialPhase: 'step1' },
};

// ─── Step 2 — Solution Clarification ─────────────────────────────────────────
// Second card after problem answers are submitted.

export const SolutionClarification: Story = {
  args: { initialPhase: 'step2' },
};

// ─── Implementation Questions ─────────────────────────────────────────────────
// Third set of questions — finalising implementation details.

export const ImplementationQuestions: Story = {
  args: { initialPhase: 'impl-questions' },
};

// ─── Plan Approval ────────────────────────────────────────────────────────────
// Approval card — approve to start the build, reject to revise.

export const PlanApproval: Story = {
  args: { initialPhase: 'approval' },
};

// ─── Building ─────────────────────────────────────────────────────────────────
// Live task ticker — each task completes every 2 s.

export const Building: Story = {
  args: { initialPhase: 'building' },
};
