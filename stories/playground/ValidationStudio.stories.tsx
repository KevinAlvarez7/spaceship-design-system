import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { ValidationStudioPage } from '@/components/docs/pages/ValidationStudioPage';

// ─── Meta ─────────────────────────────────────────────────────────────────────
//
// Validation Studio — full-lifecycle prototype. Officer walks from idea intake
// through framing, evidence planning, citizen collection, readiness gating,
// and shipping. Composes the building blocks proven in HypothesisLab,
// EvidenceStudio, and ReadinessGate into one end-to-end flow. Citizen-facing
// screens appear inline at key phases and as standalone story exports.

const meta = {
  title: 'Playground/Prototypes/Validation Studio',
  component: ValidationStudioPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Full-lifecycle validation prototype: framing → planning → citizen evidence → readiness gate → ship. Produces all four artifacts.',
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
        'homepage',
        'intake',
        'citizen-submit',
        'frame-who',
        'frame-problem-assumption',
        'frame-falsify',
        'brief-ready',
        'plan-methods',
        'plan-tasks',
        'citizen-survey',
        'citizen-interview',
        'evidence-log',
        'readiness-gate',
        'approval',
        'shipping',
        'done',
      ],
      table: { category: 'Phase' },
    },
  },
} satisfies Meta<typeof ValidationStudioPage>;

export default meta;
type Story = StoryObj<typeof ValidationStudioPage>;

// ─── Homepage ─────────────────────────────────────────────────────────────────
export const Homepage: Story = { args: { initialPhase: 'homepage' } };

// ─── Intake ───────────────────────────────────────────────────────────────────
// First-message state — assistant is processing the officer's idea.
export const Intake: Story = { args: { initialPhase: 'intake' } };

// ─── Citizen Submit (standalone) ──────────────────────────────────────────────
// Full-bleed citizen "share your experience" view.
export const CitizenSubmit: Story = { args: { initialPhase: 'citizen-submit' } };

// ─── Frame Who ────────────────────────────────────────────────────────────────
// First framing card — pick the affected citizen segment.
export const FrameWho: Story = { args: { initialPhase: 'frame-who' } };

// ─── Frame Problem + Assumption ───────────────────────────────────────────────
// Second framing card — problem + biggest assumption.
export const FrameProblemAssumption: Story = { args: { initialPhase: 'frame-problem-assumption' } };

// ─── Frame Falsifier ──────────────────────────────────────────────────────────
// Third framing card — how would we know we're wrong?
export const FrameFalsifier: Story = { args: { initialPhase: 'frame-falsify' } };

// ─── Brief Ready ──────────────────────────────────────────────────────────────
// Hypothesis brief artifact opens; CTA to plan methods.
export const BriefReady: Story = { args: { initialPhase: 'brief-ready' } };

// ─── Plan Methods ─────────────────────────────────────────────────────────────
// Multi-select method picker.
export const PlanMethods: Story = { args: { initialPhase: 'plan-methods' } };

// ─── Plan + Tasks ─────────────────────────────────────────────────────────────
// Plan artifact + live TaskList; "Launch citizen survey" CTA ready.
export const PlanTasks: Story = { args: { initialPhase: 'plan-tasks' } };

// ─── Citizen Survey (standalone) ──────────────────────────────────────────────
// Full-bleed citizen survey scene.
export const CitizenSurvey: Story = { args: { initialPhase: 'citizen-survey' } };

// ─── Citizen Interview (standalone) ───────────────────────────────────────────
// Full-bleed interview transcript with listening indicator.
export const CitizenInterview: Story = { args: { initialPhase: 'citizen-interview' } };

// ─── Evidence Log ─────────────────────────────────────────────────────────────
// Evidence collected, log artifact compiled, ready to gate.
export const EvidenceLog: Story = { args: { initialPhase: 'evidence-log' } };

// ─── Readiness Gate ───────────────────────────────────────────────────────────
// ReadinessScoreCard rendered; CTAs to preview citizen impact and continue.
export const ReadinessGate: Story = { args: { initialPhase: 'readiness-gate' } };

// ─── Approval ─────────────────────────────────────────────────────────────────
// ApprovalCard overlay — approve / request changes.
export const Approval: Story = { args: { initialPhase: 'approval' } };

// ─── Shipping ─────────────────────────────────────────────────────────────────
// Build task ticker running; readiness artifact locked.
export const Shipping: Story = { args: { initialPhase: 'shipping' } };

// ─── Done ─────────────────────────────────────────────────────────────────────
// Service launched, follow-ups scheduled.
export const Done: Story = { args: { initialPhase: 'done' } };
