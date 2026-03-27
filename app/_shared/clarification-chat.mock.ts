import type { Artifact } from '@/components/patterns/artifact-types';
import type { ClarificationQuestion } from '@/components/ui';
import type { ApprovalPlan } from '@/components/ui';

// ─── User message ─────────────────────────────────────────────────────────────

export const USER_MESSAGE =
  `Build me a relief teacher booking system for schools.`;

// ─── Assistant messages ───────────────────────────────────────────────────────

export const ASSISTANT_INTRO =
  `A relief teacher booking system — got it. Before I start building, I want to make sure we're solving the right problem. Let me ask you a few questions to understand what's actually going wrong today.`;

export const ASSISTANT_AFTER_STEP_1 =
  `That's a clear, well-grounded problem. Let me now help you figure out what the right solution looks like.`;

export const ASSISTANT_AFTER_STEP_2 =
  `This is shaping up to be a focused, two-sided booking system — admin staff on one side posting jobs, relief teachers on the other accepting them. Your Project Brief is complete.

Shall I move on to the implementation plan?`;

export const ASSISTANT_AFTER_GATE =
  `Great. Let me ask a few implementation questions so I can generate a plan with accurate time estimates and risk assessments.`;

export const ASSISTANT_AFTER_IMPL =
  `Based on your answers, I've generated an implementation plan below. Review the steps, timings, and risk levels — then approve or request changes.`;

export const ASSISTANT_REJECTION_PROMPT =
  `No problem — what would you like me to revise in the plan?`;

export const ASSISTANT_AFTER_REVISION =
  `I've updated the plan based on your feedback. Here's the revised version — let me know if this works.`;

export const ASSISTANT_AFTER_APPROVE =
  `Implementation plan approved. Starting the build now — I'll run through each task as I complete it.`;

export const ASSISTANT_BUILD_COMPLETE =
  `Your prototype is ready for user testing. All 8 tasks completed — booking flow, notifications, confirmation screens, and sample data are all in place. Share the link with your test participants when you're ready to run sessions.`;

// ─── Step 1 — Problem clarification (5 questions) ────────────────────────────

export const STEP_1_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Who is struggling the most right now?',
    options: [
      'School admin staff who arrange relief cover every day',
      'Relief teachers who need to find and confirm jobs',
      'HODs and school leaders who need to track coverage',
      'MOE HQ trying to monitor school staffing levels',
    ],
  },
  {
    type: 'multi',
    label: 'What is going wrong with how it works today?',
    options: [
      'Finding an available relief teacher takes too long',
      'Double-bookings happen — two schools book the same person',
      'Relief teachers sometimes show up to the wrong school',
      'No one can see who is available across the cluster',
      'Assignments aren\'t recorded properly so payroll gets it wrong',
      'Admin staff are spending hours on WhatsApp and phone calls every morning',
    ],
  },
  {
    type: 'single',
    label: 'How often does this happen?',
    options: [
      'Every single school day — teacher absences are a daily occurrence',
      'A few times a week',
      'Mostly during peak periods like exam season or school events',
      'Rarely, but when it happens it causes a lot of disruption',
    ],
  },
  {
    type: 'single',
    label: 'What does the school do today when a teacher is absent?',
    options: [
      'Admin staff call or WhatsApp a fixed list of relief teachers one by one',
      'There\'s a shared spreadsheet but it\'s always out of date',
      'Each school manages their own pool of relief teachers independently',
      'There\'s already a system but it doesn\'t work well',
    ],
  },
  {
    type: 'multi',
    label: 'What is this costing the school?',
    options: [
      '30 to 60 minutes of admin time lost every morning',
      'Classes being left uncovered when no relief is found in time',
      'Relief teachers becoming less responsive because the experience is frustrating',
      'Payroll errors because assignments aren\'t properly logged',
      'Senior staff or HODs being pulled away from their work to cover last-minute',
    ],
  },
];

// ─── Step 2 — Solution clarification (5 questions) ───────────────────────────

export const STEP_2_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Who is the primary user of this system?',
    options: [
      'School admin staff — they manage all the bookings',
      'Relief teachers — they manage their own availability and accept jobs',
      'Both equally — it\'s a two-sided system',
      'School leaders — they oversee and approve relief arrangements',
    ],
  },
  {
    type: 'single',
    label: 'What is the core thing this system needs to do?',
    options: [
      'Let admin staff post a relief job and automatically notify available teachers',
      'Let relief teachers set their availability and browse open jobs',
      'Replace the WhatsApp group with a structured booking and confirmation flow',
      'Give school leaders a dashboard to track coverage across the cluster',
    ],
  },
  {
    type: 'multi',
    label: 'What should the system handle?',
    options: [
      'Posting a relief job with date, time, school, and subject',
      'Notifying available relief teachers automatically',
      'Letting teachers accept or decline a job in one tap',
      'Preventing double-bookings automatically',
      'Sending confirmation details to both admin and teacher',
      'Logging completed assignments for payroll records',
      'Showing a live availability calendar across the relief pool',
    ],
  },
  {
    type: 'multi',
    label: 'What constraints do we need to design around?',
    options: [
      'Must work on mobile — admin and teachers are rarely at a desk',
      'Must be simple enough for non-tech-savvy admin staff',
      'No new accounts — should sign in with Singpass or existing school credentials',
      'Must work within MOE\'s data and security requirements',
      'Should not require relief teachers to download a new app',
    ],
  },
  {
    type: 'rank',
    label: 'Rank what matters most for this first version',
    items: [
      'Speed — admin can post a job and get a confirmed teacher in under 5 minutes',
      'Reliability — no double-bookings, ever',
      'Simplicity — anyone can use it without training',
      'Coverage — works for all schools in the cluster, not just one',
    ],
  },
];

// ─── Implementation questions (with timings + risk metadata) ─────────────────

export const IMPL_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'How should users sign in?',
    options: [
      { label: 'SGID (OGP sign-in with Singpass)',  meta: { timeEstimate: '+~3 min',  riskLevel: 'safe'   } },
      { label: 'Postman OTP (email / SMS login)',    meta: { timeEstimate: '+~2 min',  riskLevel: 'safe'   } },
      { label: 'Email and password (custom auth)',   meta: { timeEstimate: '+~2 min',  riskLevel: 'medium' } },
      { label: 'No auth — mock users for prototype', meta: { timeEstimate: '+~30 sec', riskLevel: 'safe'   } },
    ],
  },
  {
    type: 'single',
    label: 'How should relief teachers be notified of new jobs?',
    options: [
      { label: 'Postman (OGP notification service)', meta: { timeEstimate: '+~2 min', riskLevel: 'safe'   } },
      { label: 'Push notifications (FCM / APNs)',    meta: { timeEstimate: '+~3 min', riskLevel: 'unsafe' } },
      { label: 'SMS via external provider',          meta: { timeEstimate: '+~3 min', riskLevel: 'unsafe' } },
      { label: 'In-app notifications only',          meta: { timeEstimate: '+~1 min', riskLevel: 'safe'   } },
    ],
  },
  {
    type: 'multi',
    label: 'Which data integrations are needed?',
    options: [
      { label: 'MOE school staff directory',           meta: { timeEstimate: '+~5 min',  riskLevel: 'medium' } },
      { label: 'Relief teacher registry',              meta: { timeEstimate: '+~3 min',  riskLevel: 'safe'   } },
      { label: 'Payroll export (CSV)',                 meta: { timeEstimate: '+~2 min',  riskLevel: 'safe'   } },
      { label: 'Mock data only — no live integration', meta: { timeEstimate: '+~30 sec', riskLevel: 'safe'   } },
    ],
  },
  {
    type: 'single',
    label: 'Where should the prototype be hosted?',
    options: [
      { label: 'GCC (Government Commercial Cloud)',  meta: { timeEstimate: '+~5 min',  riskLevel: 'safe' } },
      { label: 'GovTech SGTS',                       meta: { timeEstimate: '+~8 min',  riskLevel: 'safe' } },
      { label: 'Spaceship sandbox (prototype only)', meta: { timeEstimate: '+~30 sec', riskLevel: 'safe' } },
    ],
  },
  {
    type: 'multi',
    label: 'Which OGP tools should be integrated?',
    options: [
      { label: 'FormSG (form builder)',        meta: { timeEstimate: '+~2 min', riskLevel: 'safe' } },
      { label: 'Isomer (static site hosting)', meta: { timeEstimate: '+~2 min', riskLevel: 'safe' } },
      { label: 'GoGov (link shortener)',       meta: { timeEstimate: '+~1 min', riskLevel: 'safe' } },
      { label: 'PairSearch (search engine)',   meta: { timeEstimate: '+~2 min', riskLevel: 'safe' } },
      { label: 'None — custom build only',     meta: { timeEstimate: '—',       riskLevel: 'safe' } },
    ],
  },
];

// ─── Implementation plan (for ApprovalCard) ───────────────────────────────────

export const IMPLEMENTATION_PLAN: ApprovalPlan = {
  title: 'Relief Teacher Booking System',
  totalEstimate: '~15 min',
  steps: [
    { title: 'Project setup and routing',                  timeEstimate: '~1 min',  riskLevel: 'safe'   },
    { title: 'Admin job posting form',                     timeEstimate: '~3 min',  riskLevel: 'safe'   },
    { title: 'Relief teacher notification view',           timeEstimate: '~3 min',  riskLevel: 'low'    },
    { title: 'One-tap accept / decline flow',              timeEstimate: '~2 min',  riskLevel: 'safe'   },
    { title: 'Booking confirmation screen',                timeEstimate: '~2 min',  riskLevel: 'safe'   },
    { title: 'Double-booking prevention logic',            timeEstimate: '~2 min',  riskLevel: 'low'    },
    { title: 'Sample data — teachers, schools, subjects',  timeEstimate: '~1 min',  riskLevel: 'safe'   },
    { title: 'End-to-end flow integration and QA',         timeEstimate: '~2 min',  riskLevel: 'low'    },
  ],
  riskSummary: {
    overallRisk: 'low',
    notes: [
      'No external non-government services connected — all data stays within government infrastructure',
      'Prototype handles information up to Restricted / Sensitive Normal',
      'Singpass integration via SGID — no external auth dependency',
      'Notifications via OGP Postman — no data sent to external providers',
    ],
  },
};

export const IMPLEMENTATION_PLAN_REVISED: ApprovalPlan = {
  ...IMPLEMENTATION_PLAN,
  steps: [
    { title: 'Project setup and routing',                  timeEstimate: '~1 min',  riskLevel: 'safe'   },
    { title: 'Admin job posting form',                     timeEstimate: '~3 min',  riskLevel: 'safe'   },
    { title: 'Relief teacher notification view',           timeEstimate: '~3 min',  riskLevel: 'low'    },
    { title: 'One-tap accept / decline flow',              timeEstimate: '~2 min',  riskLevel: 'safe'   },
    { title: 'Booking confirmation screen',                timeEstimate: '~2 min',  riskLevel: 'safe'   },
    { title: 'Availability calendar for relief teachers',  timeEstimate: '~3 min',  riskLevel: 'low'    },
    { title: 'Double-booking prevention logic',            timeEstimate: '~2 min',  riskLevel: 'low'    },
    { title: 'Sample data — teachers, schools, subjects',  timeEstimate: '~1 min',  riskLevel: 'safe'   },
    { title: 'End-to-end flow integration and QA',         timeEstimate: '~2 min',  riskLevel: 'low'    },
  ],
  totalEstimate: '~20 min',
};

// ─── Project Brief artifact ───────────────────────────────────────────────────

export const BRIEF_CONTENT_V1 = `## The Problem

Every school day, school admin staff spend **30 to 60 minutes** manually finding relief teachers via WhatsApp messages and phone calls. There is no shared availability system — each school manages their own contact list independently, which leads to double-bookings, relief teachers showing up to the wrong school, and classes being left uncovered when no one responds in time.

Relief teachers are becoming less responsive because the experience is unreliable — they receive multiple messages from different schools, have no single place to manage their availability, and sometimes arrive at a school only to find they weren't needed.

### Impact
- **30–60 minutes** of admin time lost per absence, per day
- Classes left uncovered when no relief is confirmed in time
- Declining engagement from relief teachers due to poor experience

## Who This Is For

### School Admin Staff
The primary operators of the system. They post relief jobs when a teacher is absent, track confirmation status, and ensure coverage is in place before school starts. They work on mobile and need the process to be fast and reliable.

### Relief Teachers
Contract or casual teachers who take on relief assignments across multiple schools. They need to set their availability, receive job notifications, and confirm or decline in one step.`;

export const BRIEF_CONTENT_V2 = `${BRIEF_CONTENT_V1}

## What We're Building

A **mobile-first, two-sided booking system** that replaces the current WhatsApp and phone-call process with a structured, automatic flow.

### Core Features
- **Job posting** — Admin staff post a relief job with date, time, school, subject, and notes. Takes under 60 seconds.
- **Automatic notifications** — Available relief teachers in the pool are notified immediately.
- **One-tap confirmation** — Relief teachers accept or decline with a single tap. The first to accept locks the job.
- **Double-booking prevention** — Once a teacher accepts, they are automatically marked unavailable for that slot across all schools.
- **Confirmation to both parties** — Both admin staff and the relief teacher receive a confirmation with full job details.

## What Success Looks Like

- Time from job posting to confirmed teacher drops from **45 minutes** to **under 10 minutes**
- **Zero** double-bookings
- Admin staff reclaim **30–60 minutes** per day
- Relief teachers report a better experience and take more jobs`;

export const BRIEF_ARTIFACT: Artifact = {
  id: 'brief',
  type: 'brief',
  title: 'Project Brief',
  status: 'in-progress',
  updatedAt: 'just now',
  content: BRIEF_CONTENT_V1,
};

// ─── Implementation plan artifact ────────────────────────────────────────────

export const IMPL_PLAN_CONTENT = `## Implementation Plan

**Relief Teacher Booking System** — Estimated build time: ~15 minutes

### What we're building

A mobile-first, two-sided booking system that replaces the current WhatsApp-based process. Admin staff post relief jobs; available teachers receive instant notifications and confirm with a single tap. Double-bookings are prevented automatically.

---

### Build sequence

1. **Project setup and routing** (~1 min) — Scaffold the \`Next.js\` app, configure page routing for the admin and teacher views, and set up \`Supabase\` for the database.

2. **Admin job posting form** (~3 min) — Build the form for school admin staff to post a relief job with date, time, school, subject, and notes. Validates required fields and submits to the database.

3. **Relief teacher notification view** (~3 min) — Build the notification feed where relief teachers see incoming job offers. Pulls open jobs from \`Supabase\` in real time via \`OGP Postman\`.

4. **One-tap accept / decline flow** (~2 min) — Wire up the accept and decline actions. The first teacher to accept locks the job; subsequent taps return a "job already filled" message.

5. **Booking confirmation screen** (~2 min) — Build the confirmation screen shown to both admin staff and the relief teacher after a job is accepted, including full job details and contact info.

6. **Double-booking prevention logic** (~2 min) — Add a database-level constraint and UI check to prevent a teacher from accepting two overlapping jobs. Uses \`Supabase\` row-level locking.

7. **Sample data — teachers, schools, subjects** (~1 min) — Seed the database with mock relief teachers, school names, and subject lists so the prototype is immediately demoable.

8. **End-to-end flow integration and QA** (~2 min) — Connect all screens into a complete flow, run through the full booking cycle, and fix any state or navigation issues.

---

### Security overview

**Overall risk: Low**

- No external non-government services connected — all data stays within government infrastructure
- Prototype handles information up to Restricted / Sensitive Normal
- Singpass integration via \`SGID\` — no external auth dependency
- Notifications via \`OGP Postman\` — no data leaves government infrastructure`;

export const IMPL_PLAN_CONTENT_REVISED = `## Implementation Plan (Revised)

**Relief Teacher Booking System** — Estimated build time: ~20 minutes

### What we're building

A mobile-first, two-sided booking system that replaces the current WhatsApp-based process. This revision adds an availability calendar so relief teachers can set and manage their own schedule, reducing unwanted notifications and improving response rates.

---

### Build sequence

1. **Project setup and routing** (~1 min) — Scaffold the \`Next.js\` app, configure page routing for the admin and teacher views, and set up \`Supabase\` for the database.

2. **Admin job posting form** (~3 min) — Build the form for school admin staff to post a relief job with date, time, school, subject, and notes. Validates required fields and submits to the database.

3. **Relief teacher notification view** (~3 min) — Build the notification feed where relief teachers see incoming job offers. Pulls open jobs from \`Supabase\` in real time via \`OGP Postman\`.

4. **One-tap accept / decline flow** (~2 min) — Wire up the accept and decline actions. The first teacher to accept locks the job; subsequent taps return a "job already filled" message.

5. **Booking confirmation screen** (~2 min) — Build the confirmation screen shown to both admin staff and the relief teacher after a job is accepted, including full job details and contact info.

6. **Availability calendar for relief teachers** (~3 min) — Add a weekly calendar view where relief teachers can mark themselves available or unavailable by date. Notifications are only sent for matching dates.

7. **Double-booking prevention logic** (~2 min) — Add a database-level constraint and UI check to prevent a teacher from accepting two overlapping jobs. Uses \`Supabase\` row-level locking.

8. **Sample data — teachers, schools, subjects** (~1 min) — Seed the database with mock relief teachers, school names, and subject lists so the prototype is immediately demoable.

9. **End-to-end flow integration and QA** (~2 min) — Connect all screens into a complete flow, run through the full booking cycle, and fix any state or navigation issues.

---

### Security overview

**Overall risk: Low**

- No external non-government services connected — all data stays within government infrastructure
- Prototype handles information up to Restricted / Sensitive Normal
- Singpass integration via \`SGID\` — no external auth dependency
- Notifications via \`OGP Postman\` — no data leaves government infrastructure`;

export const IMPL_PLAN_ARTIFACT: Artifact = {
  id: 'impl-plan',
  type: 'implementation',
  title: 'Implementation Plan',
  status: 'in-progress',
  updatedAt: 'just now',
  content: IMPL_PLAN_CONTENT,
};

// ─── Prototype artifact ───────────────────────────────────────────────────────

export const PROTOTYPE_ARTIFACT: Artifact = {
  id: 'prototype',
  type: 'prototype',
  title: 'Prototype',
  status: 'complete',
  updatedAt: 'just now',
  content: '',
};

// ─── Implementation tasks (for live progress ticker) ─────────────────────────

export const IMPLEMENTATION_TASKS = [
  'Setting up project structure and routing',
  'Building the admin job posting form',
  'Building the relief teacher notification view',
  'Building the one-tap accept / decline flow',
  'Building the booking confirmation screen',
  'Loading sample data — teachers, schools, subjects',
  'Connecting all screens into a complete flow',
  'Final review and launch',
];
