import type { Artifact } from '@/components/patterns/artifact-types';
import type { ClarificationQuestion } from '@/components/ui';

export type IntentPath = 'tender' | 'explore' | 'build';

// ─── Shared — User prompt ─────────────────────────────────────────────────────

export const USER_PROMPT = 'Build me a relief teacher booking system for schools.';

// ─── Shared — IntentGate ──────────────────────────────────────────────────────
// Rendered as a ClarificationCard in the chat footer after the user submits their
// first prompt and the assistant responds. Icons are applied in the page component.

export const INTENT_GATE_LABELS = [
  'Validate — "Prototype and test an idea before committing to a full build"',
  'Explore — "See what AI can build for my idea"',
  'Build — "Build a working tool for my team or myself"',
] as const;

export const MSG_BEFORE_INTENT =
  'A relief teacher booking system — that sounds like a real pain point. Before I start, let me understand how you want to approach this so I can tailor the session.';

// ─── Shared — PostSessionNudge ────────────────────────────────────────────────

export const NUDGE_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'multi',
    label: 'What happened with your prototype?',
    options: [
      'Tested or shared it with others for feedback',
      'Helped in my project proposal',
      'Helped us make a decision',
      'Still working on it',
      'Sparked a new idea',
      "Didn't end up using it",
    ],
  },
];

// ─── PathContent interface ─────────────────────────────────────────────────────

interface PathContent {
  // Assistant messages
  MSG_INTRO: string;
  MSG_AFTER_CLARIFY_1: string;
  MSG_AFTER_CLARIFY_2: string;
  MSG_QUALITY_APPROVED: string;
  MSG_QUALITY_REJECTED: string;
  MSG_AFTER_QUALITY_REVISION: string;
  MSG_AFTER_IMPL: string;
  MSG_ACK_APPROVED: string;
  MSG_ACK_REJECTED: string;
  MSG_AFTER_ACK_REVISION: string;
  MSG_BUILD_COMPLETE: string;
  MSG_RESOLUTION_APPROVED: string;
  MSG_RESOLUTION_REJECTED: string;
  MSG_AFTER_RESOLUTION_REVISION: string;

  // ClarificationCard question sets
  CLARIFY_1: ClarificationQuestion[];
  CLARIFY_2: ClarificationQuestion[];
  IMPL_QS: ClarificationQuestion[];

  // ApprovalCard labels
  ACK_APPROVE_LABEL: string;
  ACK_REJECT_LABEL: string;
  RESOLUTION_APPROVE_LABEL: string;
  RESOLUTION_REJECT_LABEL: string;

  // Artifact markdown content
  BRIEF_V1: string;
  BRIEF_V2: string;
  IMPL_PLAN: string;
  IMPL_PLAN_REVISED: string;
  ACK_REVIEW: string;
  RESOLUTION_CONTENT: string;

  // Artifacts
  BRIEF_ARTIFACT: Artifact;
  IMPL_PLAN_ARTIFACT: Artifact;
  PROTOTYPE_ARTIFACT: Artifact;
  PREVIEW_ARTIFACT: Artifact;

  // Build progress tasks
  TASKS: string[];
}

// ─── Shared brief base (all paths start from the same problem) ────────────────

const SHARED_PROBLEM = `## The Problem

Every school day, school admin staff spend **30 to 60 minutes** manually finding relief teachers via WhatsApp messages and phone calls. There is no shared availability system — each school manages their own contact list independently, which leads to double-bookings, relief teachers showing up to the wrong school, and classes being left uncovered when no one responds in time.

Relief teachers are becoming less responsive because the experience is unreliable — they receive multiple messages from different schools, have no single place to manage their availability, and sometimes arrive at a school only to find they weren't needed.

### Impact
- **30–60 minutes** of admin time lost per absence, per day
- Classes left uncovered when no relief is confirmed in time
- Declining engagement from relief teachers due to poor experience`;

const SHARED_USERS = `## Who This Is For

### School Admin Staff
The primary operators of the system. They post relief jobs when a teacher is absent, track confirmation status, and ensure coverage is in place before school starts. They work on mobile and need the process to be fast and reliable.

### Relief Teachers
Contract or casual teachers who take on relief assignments across multiple schools. They need to set their availability, receive job notifications, and confirm or decline in one step.`;

// ━━━ Path: tender — Formal tender for MOE procurement ━━━━━━━━━━━━━━━━━━━━━━━━

const TENDER_BRIEF_V1 = `${SHARED_PROBLEM}

${SHARED_USERS}

### HODs and School Leaders
Oversight role — need to track coverage rates, identify chronic staffing gaps, and report to MOE cluster supervisors. Currently have zero visibility without asking admin staff directly.

### MOE HQ (Cluster Supervisors)
Monitor aggregate staffing levels across a cluster of schools. Currently rely on monthly Excel reports compiled manually by each school.`;

const TENDER_BRIEF_V2 = `${TENDER_BRIEF_V1}

## What We're Building

A **cluster-wide relief teacher booking platform** suitable for MOE-wide deployment. Designed for tender submission — the system must demonstrate scalability across a school cluster, compliance with MOE data requirements, and integration with government infrastructure.

### Core Features
- **Job posting** — Admin staff post a relief job with date, time, school, subject, and notes. Takes under 60 seconds.
- **Automatic notifications** — Available relief teachers in the cluster pool are notified immediately via OGP Postman.
- **One-tap confirmation** — Relief teachers accept or decline with a single tap. First to accept locks the job.
- **Double-booking prevention** — Database-level constraint prevents a teacher from accepting overlapping jobs across any school in the cluster.
- **Cluster dashboard** — School leaders and cluster supervisors see real-time coverage rates, unfilled jobs, and teacher utilisation across all schools.
- **Singpass authentication** — All users authenticate via SGID. No external accounts.

## Success Metrics (for tender evaluation)

- Time from job posting to confirmed teacher drops from **45 minutes** to **under 5 minutes**
- **Zero** double-bookings across the cluster
- Coverage rate for same-day absences exceeds **95%**
- Admin staff reclaim **30–60 minutes** per day per school
- Cluster supervisors access live reporting without requesting compiled reports`;

const TENDER_IMPL_PLAN = `## Implementation Plan

**Relief Teacher Booking System — Cluster-Wide** — Estimated build time: ~18 minutes

### What we're building

A cluster-wide booking platform for MOE tender submission. Admin staff post jobs; relief teachers accept via mobile; cluster supervisors see live coverage dashboards. All infrastructure on GCC with Singpass authentication.

---

### Build sequence

1. **Project setup and routing** (~1 min) — Scaffold \`Next.js\` app, configure Supabase on GCC, set up routing for admin, teacher, and supervisor views.

2. **Admin job posting form** (~3 min) — Form for school admin to post a relief job: date, time, school, subject, class, notes. Mobile-optimised with large touch targets.

3. **Relief teacher notification view** (~3 min) — Feed of incoming jobs filtered by teacher availability. Real-time updates via Supabase subscriptions + OGP Postman push.

4. **One-tap accept / decline flow** (~2 min) — Accept locks the job atomically; decline removes from the teacher's feed. "Already filled" fallback for race conditions.

5. **Cluster coverage dashboard** (~3 min) — Real-time view for school leaders and cluster supervisors. Coverage rate by school, unfilled jobs, teacher utilisation, and response time metrics.

6. **Double-booking prevention** (~2 min) — Supabase row-level locking + unique constraint on (teacher_id, date, period). UI check + database constraint for defence in depth.

7. **Singpass / SGID authentication** (~2 min) — Configure SGID OAuth flow for all user roles. Role-based access: admin, teacher, supervisor.

8. **Sample data and end-to-end QA** (~2 min) — Seed 5 schools, 30 relief teachers, and 20 open jobs. Run the full booking cycle from posting to confirmation to dashboard update.

---

### Security overview

**Overall risk: Low**

- GCC hosting — all data within government infrastructure
- Singpass / SGID — no external auth dependency
- Notifications via OGP Postman — no data sent to external providers
- Data classification: Official (Closed) — teacher contact details and school staffing`;

const TENDER_IMPL_PLAN_REVISED = `## Implementation Plan (Revised)

**Relief Teacher Booking System — Cluster-Wide** — Estimated build time: ~22 minutes

### Revision

Adds a **teacher availability calendar** so relief teachers can set recurring availability by day-of-week. Notifications are only sent to teachers marked available for that date, reducing noise and improving response rates.

---

### Build sequence

1. **Project setup and routing** (~1 min)
2. **Admin job posting form** (~3 min)
3. **Relief teacher notification view** (~3 min)
4. **One-tap accept / decline flow** (~2 min)
5. **Teacher availability calendar** (~3 min) — Weekly recurring calendar. Teachers mark available days and preferred subjects. Job notifications filtered by availability.
6. **Cluster coverage dashboard** (~3 min)
7. **Double-booking prevention** (~2 min)
8. **Singpass / SGID authentication** (~2 min)
9. **Sample data and end-to-end QA** (~2 min)`;

const TENDER_ACK_REVIEW = `## Security & Governance Review

**Relief Teacher Booking System — MOE Tender Submission**

---

### Data handling

| Item | Assessment |
|------|-----------|
| PII scope | Teacher names, phone numbers, email, school assignments |
| Storage | GCC — Supabase instance within government commercial cloud |
| Classification | Official (Closed) — school staffing data |
| Retention | Per MOE IM8 guidelines — staffing records retained for current academic year |

### Compliance

- **PDPA** — Teacher PII collected with consent at registration. Used only for booking notifications. No secondary use.
- **IM8** — GCC hosting satisfies all IM8 infrastructure requirements for Official (Closed)
- **Singpass / SGID** — All users authenticate via government identity. No external auth.
- **OGP Postman** — Notifications routed through government infrastructure only

### Risk level: **Low**

Standard MOE operational tool. No citizen-facing surface. Teacher PII is limited to professional contact details already held by MOE.`;

const TENDER_RESOLUTION_CONTENT = `## Tender Proposal Ready

**Relief Teacher Booking System — Cluster-Wide Deployment**

---

Your tender package is complete:

- **Project Brief** — Problem statement, user personas, success metrics, and cluster-wide architecture
- **Implementation Plan** — 8-step build sequence, 18-minute prototype, Low risk
- **Working Prototype** — Full booking cycle: posting → notification → accept → confirmation → dashboard
- **Security Review** — GCC, Singpass, IM8 compliance documented

### For the MOE procurement committee

1. The brief demonstrates clear ROI — 30–60 min saved per school per day
2. Live prototype shows the full end-to-end flow across 5 schools
3. Security review is ready for SNDGO sign-off

### After approval

- File tender with GovTech Procurement
- Engage MOE HRMS team for teacher registry integration
- Schedule SGID API access with NDI`;

const TENDER_CLARIFY_1: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Who is struggling the most right now?',
    options: [
      'School admin staff who arrange relief cover every day',
      'Relief teachers who need to find and confirm jobs',
      'HODs and school leaders who need to track coverage',
      'MOE cluster supervisors monitoring staffing levels',
      'Others',
    ],
    freeText: true,
  },
  {
    type: 'multi',
    label: 'What are the biggest problems with how it works today?',
    options: [
      'Finding an available relief teacher takes too long',
      'Double-bookings happen across schools in the cluster',
      'No shared visibility into who is available across schools',
      'Cluster supervisors have no real-time staffing data',
      'Payroll errors from manually logged assignments',
    ],
  },
  {
    type: 'single',
    label: 'How many schools would this need to serve?',
    options: [
      'One school — pilot before cluster rollout',
      'A cluster of 5–8 schools sharing a relief pool',
      'An entire zone — 15+ schools',
      'National deployment — all MOE schools',
    ],
  },
  {
    type: 'single',
    label: 'What does the school do today when a teacher is absent?',
    options: [
      'Admin staff call or WhatsApp a fixed list one by one',
      "There's a shared spreadsheet that's always out of date",
      'Each school manages their own relief pool independently',
      "There's an existing system but it doesn't work well",
      'Others',
    ],
    freeText: true,
  },
  {
    type: 'rank',
    label: 'Rank the biggest costs of the current process',
    items: [
      '30–60 minutes of admin time lost every morning',
      'Classes left uncovered when no relief is found in time',
      'Relief teachers becoming less responsive over time',
      'Senior staff pulled away to cover last-minute',
    ],
  },
];

const TENDER_CLARIFY_2: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Who is the primary user of this system?',
    options: [
      'School admin staff — they manage all the bookings',
      'Relief teachers — they manage availability and accept jobs',
      "Both equally — it's a two-sided system",
      'School leaders — they oversee and approve arrangements',
    ],
  },
  {
    type: 'single',
    label: 'What is the core thing this system needs to do?',
    options: [
      'Post a relief job and auto-notify available teachers',
      'Let relief teachers set availability and browse open jobs',
      'Give cluster supervisors a live dashboard of coverage rates',
      'Replace WhatsApp with a structured booking flow',
    ],
  },
  {
    type: 'rank',
    label: 'Rank the features by importance for the tender submission',
    items: [
      'Automatic notifications to available teachers',
      'One-tap accept / decline for relief teachers',
      'Double-booking prevention across the cluster',
      'Cluster-wide coverage dashboard for supervisors',
    ],
  },
  {
    type: 'multi',
    label: 'Which constraints must the tender proposal address?',
    options: [
      'Must work on mobile — admin staff are never at a desk',
      'Singpass / SGID authentication — no external accounts',
      'GCC hosting — all data within government infrastructure',
      'Must comply with MOE data and IM8 requirements',
      'Must scale to cluster-wide deployment from day one',
    ],
  },
  {
    type: 'single',
    label: 'What success metric matters most for the tender evaluation?',
    options: [
      'Speed — confirmed teacher in under 5 minutes',
      'Reliability — zero double-bookings, ever',
      'Coverage rate — 95%+ of same-day absences filled',
      'Scalability — works across all schools in the cluster',
    ],
  },
];

const TENDER_IMPL_QS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'How should users sign in?',
    options: [
      'Singpass / SGID — mandatory for MOE tender',
      'Singpass with fallback OTP for relief teachers',
      'No auth — mock users for the prototype demo',
      'Others',
    ],
    freeText: true,
  },
  {
    type: 'single',
    label: 'How should relief teachers be notified?',
    options: [
      'OGP Postman (government notification service)',
      'Push notifications (FCM / APNs)',
      'SMS via Twilio',
      'In-app notifications only',
    ],
  },
  {
    type: 'multi',
    label: 'Which data integrations are needed?',
    options: [
      'MOE teacher registry — pre-populate teacher profiles',
      'School timetable system — auto-detect coverage gaps',
      'Payroll export (CSV) — for relief teacher payment',
      'Mock data only — no live integration for tender demo',
    ],
  },
  {
    type: 'single',
    label: 'Where should the prototype be hosted?',
    options: [
      'GCC — required for a live MOE service',
      'Spaceship sandbox — sufficient for tender prototype',
      'GovTech SGTS',
      'Others',
    ],
  },
  {
    type: 'rank',
    label: 'Rank OGP tools by integration priority',
    items: [
      'Postman (notifications to relief teachers)',
      'FormSG (supplementary teacher registration forms)',
      'GoGov (shortlink for the booking portal)',
      'Isomer (landing page for schools)',
    ],
  },
];

// ━━━ Path: explore — Problem space exploration ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const EXPLORE_BRIEF_V1 = `${SHARED_PROBLEM}

${SHARED_USERS}

### What we don't know yet

The relief teacher problem has multiple dimensions — operational (admin process), relational (teacher engagement), systemic (pool size and distribution). Before building anything, we want to map the problem space and identify which angle a digital tool could most impact.`;

const EXPLORE_BRIEF_V2 = `${EXPLORE_BRIEF_V1}

## What We're Exploring

Three possible intervention points for a relief teacher booking tool. The goal is to identify **which one is worth prototyping** before committing to a build.

### Angle 1: Speed — Admin workflow automation
Replace the manual call-around with an instant job posting and notification system. The core bet: if we reduce the time from absence to confirmed relief from 45 minutes to under 5 minutes, the knock-on problems (uncovered classes, disengaged teachers) resolve themselves.

### Angle 2: Engagement — Teacher experience
The problem isn't finding a teacher — it's that teachers stop responding. If we give relief teachers a better experience (one app, clear availability management, reliable notifications), response rates go up and the pool stays active.

### Angle 3: Visibility — Cluster-level coordination
Individual schools can't see beyond their own contact list. If we give cluster supervisors a shared pool view, schools with surplus can cover schools with shortage. The system optimises at cluster level, not school level.

## What Success Looks Like for This Exploration

- We identify the **one intervention point** that addresses the root cause, not just a symptom
- Policy team can make a **go/no-go decision** on whether to fund a formal pilot
- If we do build, we know **which angle to prototype first** and can scope it tightly`;

const EXPLORE_IMPL_PLAN = `## Exploration Prototype Plan

**Relief Teacher Booking — Problem Space Exploration** — Estimated build time: ~14 minutes

### What we're building

A concept prototype with three interactive scenarios — one for each intervention angle. Each scenario demonstrates a different approach to the relief teacher problem so the policy team can compare them side by side.

---

### Build sequence

1. **Project setup** (~1 min) — Scaffold the app and configure routing for the three scenario views.

2. **Scenario A: Admin workflow** (~3 min) — Post a job, see notification sent, one-tap accept. Focus on speed: show a timer counting how fast the booking is confirmed vs. the current 45-minute average.

3. **Scenario B: Teacher experience** (~3 min) — Teacher availability calendar, personalised job feed, clear accept/decline UX. Focus on engagement: show response rate metrics and teacher satisfaction indicators.

4. **Scenario C: Cluster visibility** (~3 min) — Cross-school relief pool map. Drag a teacher from a surplus school to a shortage school. Focus on utilisation: show idle teacher hours recovered.

5. **Comparison dashboard** (~2 min) — Side-by-side comparison of the three scenarios: which metric improves most under each approach.

6. **Sample data — 5 schools, 30 teachers** (~1 min) — Synthetic data for all three scenarios. Varying absence rates, pool sizes, and response rates to make the comparison realistic.

7. **Concept narrative page** (~1 min) — Overview of the exploration, the three angles, and the data governance commitments for any future pilot.

8. **End-to-end walkthrough** (~1 min) — Connect all screens, verify scenario switching works cleanly.

---

### Data governance

**Risk level: Low (for prototype)**

- Fully synthetic data — no real teacher or school information
- No MOE system integration — standalone sandbox prototype`;

const EXPLORE_IMPL_PLAN_REVISED = `## Exploration Prototype Plan (Revised)

**Relief Teacher Booking — Problem Space Exploration** — Estimated build time: ~17 minutes

### Revision

Adds a **teacher pulse survey** — a short in-app survey embedded in Scenario B (Teacher Experience) to validate whether teacher disengagement is really the root cause. Shows mock survey results to demonstrate the insight-gathering capability.

---

### Build sequence

1. **Project setup** (~1 min)
2. **Scenario A: Admin workflow** (~3 min)
3. **Scenario B: Teacher experience** (~3 min)
4. **Teacher pulse survey** (~3 min) — 3-question survey: why did you decline the last job? What would make you accept more? How many schools do you work with?
5. **Scenario C: Cluster visibility** (~3 min)
6. **Comparison dashboard** (~2 min)
7. **Sample data** (~1 min)
8. **End-to-end walkthrough** (~1 min)`;

const EXPLORE_ACK_REVIEW = `## Data Governance Acknowledgement

**Relief Teacher Booking — Exploration Prototype**

---

### Prototype scope

This is an **exploratory prototype using fully synthetic data only**. No real teacher, school, or student data is used at any stage.

| Item | Assessment |
|------|-----------|
| Data used | 100% synthetic — generated programmatically |
| Identifiers | None — fake teacher names and school codes |
| Storage | Spaceship sandbox — ephemeral, not connected to MOE systems |
| External access | None — prototype is internal-only |

### Before any pilot with real data

A move to real data would require:
- MOE HR Division approval for teacher contact data access
- School leader consent for staffing visibility
- Data sharing agreement if crossing cluster boundaries
- PDPA compliance review for teacher PII

### Risk level: **Low (for this prototype)**

Synthetic data only — no data protection obligations at this stage.`;

const EXPLORE_RESOLUTION_CONTENT = `## Exploration Complete

**Relief Teacher Booking — Problem Space Analysis**

---

Your exploration package is ready:

- **Exploration Brief** — Problem framing, three intervention angles, evaluation criteria
- **Concept Prototype** — Interactive scenarios for Admin Workflow, Teacher Experience, and Cluster Visibility
- **Data Governance** — Commitments and requirements for any real-data follow-up

### Is this enough for a team discussion?

The three scenarios demonstrate the trade-offs clearly. Your policy team can compare:
- **Speed** (Angle 1) vs. **Engagement** (Angle 2) vs. **Visibility** (Angle 3)
- Which metric matters most: booking time, response rate, or utilisation

### Suggested next steps

- Walk 2–3 school admin staff through the scenarios to get their reaction
- Present to the policy team for a go/no-go on pursuing a formal pilot
- If approved, scope the chosen angle as a single-school pilot`;

const EXPLORE_CLARIFY_1: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Who is struggling the most with the current relief process?',
    options: [
      'Admin staff who spend every morning calling around',
      'Relief teachers who feel burned out by the chaos',
      'HODs who lose teaching time covering last-minute',
      'Students who end up with unsupervised free periods',
      'Others',
    ],
    freeText: true,
  },
  {
    type: 'multi',
    label: 'Which aspects of the problem are you most curious about?',
    options: [
      'Why does it take so long to find available relief teachers?',
      'Why do relief teachers stop responding to requests?',
      'Why can\'t schools share relief pools with nearby schools?',
      'Is the problem worse at certain times of year?',
      'Are some schools coping fine — and if so, how?',
    ],
  },
  {
    type: 'single',
    label: 'Have you already identified a likely solution, or is this truly open-ended?',
    options: [
      'Open-ended — I want to understand the problem before deciding',
      'I think it\'s a workflow problem — admin process is too manual',
      'I think it\'s a supply problem — not enough relief teachers',
      'I think it\'s a visibility problem — schools can\'t see each other\'s pools',
    ],
  },
  {
    type: 'single',
    label: 'How does a relief teacher get booked today?',
    options: [
      'Admin calls or WhatsApps a fixed list one by one',
      'A shared spreadsheet that nobody keeps updated',
      'Each school manages their own pool independently',
      'There\'s a system but it doesn\'t capture the full picture',
      'Others',
    ],
    freeText: true,
  },
  {
    type: 'rank',
    label: 'Rank which costs you want to understand better',
    items: [
      'Admin time lost every morning on the call-around',
      'Classes left uncovered — impact on students',
      'Relief teacher burnout and declining pool size',
      'Senior staff diverted from their real responsibilities',
    ],
  },
];

const EXPLORE_CLARIFY_2: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'What kind of output would be most useful from this exploration?',
    options: [
      'A comparison of 3 different approaches to the problem',
      'A deep dive into one specific angle with a concept prototype',
      'A research brief summarising what we know and don\'t know',
      'A quick prototype to test one hypothesis with real users',
    ],
  },
  {
    type: 'multi',
    label: 'Which intervention angles interest you most?',
    options: [
      'Speed — automate the admin workflow so bookings happen in minutes',
      'Engagement — improve the relief teacher experience so they keep responding',
      'Visibility — share relief pools across a cluster of schools',
      'Prediction — forecast absences so relief can be pre-arranged',
      'Supply — recruit and onboard more relief teachers',
    ],
  },
  {
    type: 'rank',
    label: 'Rank these success criteria for the exploration',
    items: [
      'We identify the root cause, not just a symptom',
      'The policy team can make a clear go/no-go decision',
      'We learn something surprising we didn\'t expect',
      'We can scope a pilot tightly if we decide to build',
    ],
  },
  {
    type: 'multi',
    label: 'What constraints should guide the exploration?',
    options: [
      'Must use synthetic data only — no real teacher or school data',
      'Must be shareable with non-technical policy colleagues',
      'Must show at least 2 different approaches for comparison',
      'Must be buildable in a single session',
    ],
  },
  {
    type: 'single',
    label: 'What would make this exploration a failure?',
    options: [
      'We build something without understanding why the current process fails',
      'We only explore one angle and miss a better approach',
      'The output is too technical for the policy team to evaluate',
      'We spend too long exploring and never get to a recommendation',
    ],
  },
];

const EXPLORE_IMPL_QS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'What should the prototype demonstrate to your team?',
    options: [
      'Side-by-side comparison of 3 intervention scenarios',
      'One deep scenario with realistic interaction flow',
      'A data dashboard showing the problem quantitatively',
      'A narrative walkthrough with embedded concept screens',
    ],
  },
  {
    type: 'single',
    label: 'How should the synthetic data be structured?',
    options: [
      '5 schools, 30 teachers — enough to show cluster dynamics',
      '1 school, 10 teachers — focused single-school view',
      'Aggregate view only — no individual teacher profiles',
      'Others',
    ],
  },
  {
    type: 'multi',
    label: 'Which prototype screens matter most?',
    options: [
      'Scenario comparison dashboard — which angle wins?',
      'Admin workflow timeline — show the speed improvement',
      'Teacher experience mockup — app interface for relief teachers',
      'Cluster map — schools sharing a common pool',
      'Concept narrative — explain the approach to non-technical readers',
    ],
  },
  {
    type: 'single',
    label: 'Where should the prototype be hosted?',
    options: [
      'Spaceship sandbox — internal sharing with the policy team',
      'Isomer — static concept site for broader distribution',
      'Local only — no hosting needed',
    ],
  },
  {
    type: 'rank',
    label: 'Rank what matters most for the exploration prototype',
    items: [
      'Clarity — the three scenarios are immediately understandable',
      'Comparison — the trade-offs are visible at a glance',
      'Speed — can be built and shared within a day',
      'Depth — each scenario feels realistic enough to evaluate',
    ],
  },
];

// ━━━ Path: build — Quick internal tool ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BUILD_BRIEF_V1 = `${SHARED_PROBLEM}

${SHARED_USERS}`;

const BUILD_BRIEF_V2 = `${BUILD_BRIEF_V1}

## What We're Building

A **simple, two-sided booking system** for one school's admin team and their regular relief teachers. No cluster features, no dashboard for leadership — just the core booking loop done well.

### Core Features
- **Job posting** — Admin posts a relief job with date, time, subject, and notes. Under 60 seconds on mobile.
- **Automatic notifications** — Available relief teachers are notified immediately.
- **One-tap accept / decline** — First teacher to accept locks the job. No back-and-forth.
- **Double-booking prevention** — Once a teacher accepts, they're unavailable for that slot.
- **Confirmation to both parties** — Admin and teacher both see confirmation with full details.

## What Success Looks Like

- Time from posting to confirmed teacher drops from **45 minutes** to **under 5 minutes**
- **Zero** double-bookings
- Admin staff reclaim **30–60 minutes** per day
- Relief teachers report a better experience and take more jobs`;

const BUILD_IMPL_PLAN = `## Implementation Plan

**Relief Teacher Booking System** — Estimated build time: ~15 minutes

### What we're building

A mobile-first, two-sided booking system replacing the WhatsApp call-around. Admin staff post jobs; relief teachers accept with one tap. Double-bookings are prevented automatically.

---

### Build sequence

1. **Project setup and routing** (~1 min) — Scaffold the \`Next.js\` app, configure Supabase, set up admin and teacher views.

2. **Admin job posting form** (~3 min) — Form for posting a relief job: date, time, school, subject, notes. Mobile-optimised.

3. **Relief teacher notification view** (~3 min) — Notification feed showing incoming job offers. Real-time via Supabase + OGP Postman.

4. **One-tap accept / decline flow** (~2 min) — Accept locks the job; decline removes from feed. "Already filled" fallback.

5. **Booking confirmation screen** (~2 min) — Confirmation shown to both admin and teacher with full job details and contact info.

6. **Double-booking prevention logic** (~2 min) — Database constraint + UI check. Supabase row-level locking.

7. **Sample data — teachers, schools, subjects** (~1 min) — Seed with mock teachers, school name, and subject list.

8. **End-to-end flow integration and QA** (~1 min) — Connect all screens, run the full booking cycle, fix navigation issues.

---

### Security overview

**Overall risk: Low**

- No external non-government services — all data within government infrastructure
- Prototype handles information up to Restricted / Sensitive Normal
- Singpass via SGID — no external auth dependency
- Notifications via OGP Postman — no data leaves government infrastructure`;

const BUILD_IMPL_PLAN_REVISED = `## Implementation Plan (Revised)

**Relief Teacher Booking System** — Estimated build time: ~20 minutes

### Revision

Adds an **availability calendar** so relief teachers can set their available days. Notifications only go to teachers marked available for that date — reducing noise and improving response rates.

---

### Build sequence

1. **Project setup and routing** (~1 min)
2. **Admin job posting form** (~3 min)
3. **Relief teacher notification view** (~3 min)
4. **One-tap accept / decline flow** (~2 min)
5. **Booking confirmation screen** (~2 min)
6. **Availability calendar for relief teachers** (~3 min) — Weekly calendar view. Teachers mark available days. Notifications filtered by availability.
7. **Double-booking prevention logic** (~2 min)
8. **Sample data — teachers, schools, subjects** (~1 min)
9. **End-to-end flow integration and QA** (~2 min)`;

const BUILD_ACK_REVIEW = `## Data Handling Acknowledgement

**Relief Teacher Booking System — Single School Internal Tool**

---

### Tool scope

Internal booking tool for one school's admin team and their pool of ~15 relief teachers.

| Item | Assessment |
|------|-----------|
| PII | Teacher names and phone numbers — already held by the school |
| Storage | Spaceship sandbox — appropriate for single-school pilot |
| Classification | Restricted / Sensitive Normal |
| External access | None — school staff only |

### Compliance

- **PDPA** — Teacher contact data used for booking notifications only
- **IM8** — Spaceship sandbox acceptable for prototype; migrate to GCC for production
- **Auth** — No auth for prototype; add Singpass if adopted beyond pilot

### Risk level: **Low**

Single-school internal tool. No citizen data. Teacher PII limited to professional contact details already managed by the school.`;

const BUILD_RESOLUTION_CONTENT = `## Booking System Ready

**Relief Teacher Booking System** — Ready for your school

---

Your tool is built and working:

- **Job posting** — Post a relief job in under 60 seconds
- **Teacher notifications** — Available teachers notified immediately
- **One-tap booking** — First to accept locks the job
- **No more double-bookings** — enforced at the database level
- **Sample data loaded** — 15 mock teachers and 5 subjects ready to test

### Share it with your admin team

Send the Spaceship link to your school's admin staff. They can start using it for real relief bookings as early as tomorrow morning.

### Suggested next steps

1. Run one week alongside the current WhatsApp process — compare speed and accuracy
2. Ask 3–4 relief teachers to try the mobile experience and give feedback
3. If the school adopts it, file a request to migrate to GCC for permanent hosting`;

const BUILD_CLARIFY_1: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Who is struggling the most right now?',
    options: [
      'School admin staff who arrange relief cover every day',
      'Relief teachers who need to find and confirm jobs',
      'HODs and school leaders who need to track coverage',
      'MOE HQ trying to monitor school staffing levels',
      'Others',
    ],
    freeText: true,
  },
  {
    type: 'multi',
    label: 'What are the biggest problems with how it works today?',
    options: [
      'Finding an available relief teacher takes too long',
      'Double-bookings happen across schools',
      'Relief teachers show up to the wrong school',
      'No shared visibility into who is available',
      'Payroll errors from unlogged assignments',
    ],
  },
  {
    type: 'single',
    label: 'How often does this happen?',
    options: [
      'Every school day — absences are a daily occurrence',
      'A few times a week',
      'Mostly during peak periods like exam season',
      'Rarely, but causes major disruption when it does',
    ],
  },
  {
    type: 'single',
    label: 'What does the school do today when a teacher is absent?',
    options: [
      'Admin staff call or WhatsApp a fixed list one by one',
      "There's a shared spreadsheet that's always out of date",
      'Each school manages their own relief pool independently',
      "There's already a system but it doesn't work well",
      'Others',
    ],
    freeText: true,
  },
  {
    type: 'rank',
    label: 'Rank the biggest costs of the current process',
    items: [
      '30–60 minutes of admin time lost every morning',
      'Classes left uncovered when no relief is found in time',
      'Relief teachers becoming less responsive over time',
      'Senior staff pulled away to cover last-minute',
    ],
  },
];

const BUILD_CLARIFY_2: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Who is the primary user of this system?',
    options: [
      'School admin staff — they manage all the bookings',
      'Relief teachers — they manage availability and accept jobs',
      "Both equally — it's a two-sided system",
      'School leaders — they oversee and approve arrangements',
    ],
  },
  {
    type: 'single',
    label: 'What is the core thing this system needs to do?',
    options: [
      'Post a relief job and auto-notify available teachers',
      'Let relief teachers set availability and browse open jobs',
      'Replace WhatsApp with a structured booking flow',
      'Give school leaders a dashboard to track coverage',
    ],
  },
  {
    type: 'rank',
    label: 'Rank the features by importance for v1',
    items: [
      'Posting a relief job with date, time, school, and subject',
      'Automatic notifications to available teachers',
      'One-tap accept / decline for relief teachers',
      'Double-booking prevention',
    ],
  },
  {
    type: 'multi',
    label: 'Which constraints must we design around?',
    options: [
      'Must work on mobile — admin are rarely at a desk',
      'Must be simple enough for non-tech-savvy staff',
      'No new accounts — keep it as simple as possible',
      'Must handle 5–15 relief teachers in the pool',
      'No app download required for relief teachers',
    ],
  },
  {
    type: 'single',
    label: 'What matters most for this first version?',
    options: [
      'Speed — confirmed teacher in under 5 minutes',
      'Reliability — no double-bookings, ever',
      'Simplicity — anyone can use it without training',
      'Coverage — handles all common absence scenarios',
    ],
  },
];

const BUILD_IMPL_QS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'How should users sign in?',
    options: [
      'SGID (OGP sign-in with Singpass)',
      'Postman OTP (email / SMS login)',
      'Email and password (custom auth)',
      'No auth — mock users for prototype',
      'Others',
    ],
    freeText: true,
  },
  {
    type: 'single',
    label: 'How should relief teachers be notified of new jobs?',
    options: [
      'Postman (OGP notification service)',
      'Push notifications (FCM / APNs)',
      'SMS via external provider',
      'In-app notifications only',
    ],
  },
  {
    type: 'multi',
    label: 'Which data integrations are needed?',
    options: [
      'MOE school staff directory',
      'Relief teacher registry',
      'Payroll export (CSV)',
      'Mock data only — no live integration',
    ],
  },
  {
    type: 'single',
    label: 'Where should the prototype be hosted?',
    options: [
      'GCC (Government Commercial Cloud)',
      'GovTech SGTS',
      'Spaceship sandbox (prototype only)',
      'Others',
    ],
  },
  {
    type: 'rank',
    label: 'Rank OGP tools by integration priority',
    items: [
      'FormSG (form builder)',
      'Postman (notifications)',
      'GoGov (link shortener)',
      'Isomer (static site hosting)',
    ],
  },
];

// ━━━ PATH_CONTENT record ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PATH_CONTENT: Record<IntentPath, PathContent> = {

  // ─── tender ────────────────────────────────────────────────────────────────

  tender: {
    MSG_INTRO:
      "Got it — you want to develop this into a formal tender proposal. I'll structure the session to produce a brief, implementation plan, and working prototype that's ready for the MOE procurement committee. Let me start with some questions about the problem.",

    MSG_AFTER_CLARIFY_1:
      "Clear picture. This is a cluster-wide staffing problem, not just a single-school inconvenience. Let me now help you scope the right solution for a tender submission.",

    MSG_AFTER_CLARIFY_2:
      "This is shaping up to be a strong tender proposal — a cluster-wide, two-sided booking platform with Singpass auth and a supervisor dashboard. Your Project Brief is ready for review.",

    MSG_QUALITY_APPROVED:
      "Brief approved. Let me ask a few implementation questions so I can generate a build plan with accurate time estimates and risk assessments for the tender.",

    MSG_QUALITY_REJECTED:
      "No problem — what needs to change in the brief? Tell me what's missing or incorrect.",

    MSG_AFTER_QUALITY_REVISION:
      "I've updated the brief based on your feedback. Take another look.",

    MSG_AFTER_IMPL:
      "Based on your answers, here's the implementation plan. Review the build steps, timings, and security overview — then I'll need you to sign off on the governance requirements before I start building.",

    MSG_ACK_APPROVED:
      "Governance requirements accepted. Building the prototype now — I'll complete each task as I go.",

    MSG_ACK_REJECTED:
      "Understood. What do you need to verify with your team? I'll hold the build until you've confirmed.",

    MSG_AFTER_ACK_REVISION:
      "Thanks for confirming. The security posture is unchanged. Ready to build.",

    MSG_BUILD_COMPLETE:
      "Your prototype is ready for the tender demo. The full booking cycle — posting, notification, accept, confirmation, and cluster dashboard — is built and running with sample data across 5 schools.",

    MSG_RESOLUTION_APPROVED:
      "Good luck at the procurement committee. Your brief, plan, and prototype are all in the artifact panel.",

    MSG_RESOLUTION_REJECTED:
      "What else do you need before the submission? Tell me and I'll build or revise it.",

    MSG_AFTER_RESOLUTION_REVISION:
      "Done. Is the package ready for submission now?",

    CLARIFY_1: TENDER_CLARIFY_1,
    CLARIFY_2: TENDER_CLARIFY_2,
    IMPL_QS: TENDER_IMPL_QS,

    ACK_APPROVE_LABEL: 'Yes, I accept the governance requirements',
    ACK_REJECT_LABEL: 'I need to check with my team',
    RESOLUTION_APPROVE_LABEL: 'Yes, ready to submit',
    RESOLUTION_REJECT_LABEL: 'Not quite there yet',

    BRIEF_V1: TENDER_BRIEF_V1,
    BRIEF_V2: TENDER_BRIEF_V2,
    IMPL_PLAN: TENDER_IMPL_PLAN,
    IMPL_PLAN_REVISED: TENDER_IMPL_PLAN_REVISED,
    ACK_REVIEW: TENDER_ACK_REVIEW,
    RESOLUTION_CONTENT: TENDER_RESOLUTION_CONTENT,

    BRIEF_ARTIFACT: { id: 'brief', type: 'brief', title: 'Project Brief', status: 'in-progress', updatedAt: 'just now', content: TENDER_BRIEF_V1 },
    IMPL_PLAN_ARTIFACT: { id: 'impl-plan', type: 'implementation', title: 'Implementation Plan', status: 'in-progress', updatedAt: 'just now', content: TENDER_IMPL_PLAN },
    PROTOTYPE_ARTIFACT: { id: 'prototype', type: 'prototype', title: 'Prototype', status: 'complete', updatedAt: 'just now', content: '' },
    PREVIEW_ARTIFACT: { id: 'preview', type: 'preview', title: 'Live Preview', status: 'complete', updatedAt: 'just now', content: '' },

    TASKS: [
      'Setting up project structure and routing',
      'Building the admin job posting form',
      'Building the relief teacher notification view',
      'Building the one-tap accept / decline flow',
      'Building the cluster coverage dashboard',
      'Adding double-booking prevention logic',
      'Configuring Singpass / SGID authentication',
      'Loading sample data and running end-to-end QA',
    ],
  },

  // ─── explore ───────────────────────────────────────────────────────────────

  explore: {
    MSG_INTRO:
      "Interesting — you want to explore the problem space before committing to a specific solution. I'll help you map the different angles and figure out which one is actually worth building. Let me start with some questions.",

    MSG_AFTER_CLARIFY_1:
      "Good context. It sounds like the problem might have multiple root causes — process inefficiency, teacher disengagement, or lack of cross-school visibility. Let me help you figure out which angle to explore.",

    MSG_AFTER_CLARIFY_2:
      "Your Exploration Brief is ready. It frames the three main intervention angles so your team can compare them before deciding which to prototype.",

    MSG_QUALITY_APPROVED:
      "Brief looks right. Let me ask a few questions about what the concept prototype should show.",

    MSG_QUALITY_REJECTED:
      "What needs adjusting? Tell me which framing doesn't feel right.",

    MSG_AFTER_QUALITY_REVISION:
      "Updated. Does this framing better capture the exploration you want to do?",

    MSG_AFTER_IMPL:
      "I've planned the exploration prototype based on your answers. Review the scope before I proceed — I'll also need you to acknowledge the data governance commitments.",

    MSG_ACK_APPROVED:
      "Acknowledged. Building the exploration prototype now using fully synthetic data.",

    MSG_ACK_REJECTED:
      "Understood. What needs to be confirmed before we proceed? I'll hold the build.",

    MSG_AFTER_ACK_REVISION:
      "Thanks for following up. The prototype uses only synthetic data. Ready to build.",

    MSG_BUILD_COMPLETE:
      "Your exploration prototype is ready. Three interactive scenarios — admin workflow, teacher experience, and cluster visibility — are built with synthetic data. Walk your policy team through the comparison dashboard to decide which angle is worth pursuing.",

    MSG_RESOLUTION_APPROVED:
      "Good luck with the team discussion. Everything is in the artifact panel.",

    MSG_RESOLUTION_REJECTED:
      "What would help the team decide? Tell me what's missing.",

    MSG_AFTER_RESOLUTION_REVISION:
      "Added. Is this enough for the discussion now?",

    CLARIFY_1: EXPLORE_CLARIFY_1,
    CLARIFY_2: EXPLORE_CLARIFY_2,
    IMPL_QS: EXPLORE_IMPL_QS,

    ACK_APPROVE_LABEL: 'Yes, synthetic data only is fine',
    ACK_REJECT_LABEL: 'I need to confirm data governance',
    RESOLUTION_APPROVE_LABEL: 'Yes, enough for the team discussion',
    RESOLUTION_REJECT_LABEL: 'I need more depth',

    BRIEF_V1: EXPLORE_BRIEF_V1,
    BRIEF_V2: EXPLORE_BRIEF_V2,
    IMPL_PLAN: EXPLORE_IMPL_PLAN,
    IMPL_PLAN_REVISED: EXPLORE_IMPL_PLAN_REVISED,
    ACK_REVIEW: EXPLORE_ACK_REVIEW,
    RESOLUTION_CONTENT: EXPLORE_RESOLUTION_CONTENT,

    BRIEF_ARTIFACT: { id: 'brief', type: 'brief', title: 'Exploration Brief', status: 'in-progress', updatedAt: 'just now', content: EXPLORE_BRIEF_V1 },
    IMPL_PLAN_ARTIFACT: { id: 'impl-plan', type: 'implementation', title: 'Exploration Prototype Plan', status: 'in-progress', updatedAt: 'just now', content: EXPLORE_IMPL_PLAN },
    PROTOTYPE_ARTIFACT: { id: 'prototype', type: 'prototype', title: 'Concept Prototype', status: 'complete', updatedAt: 'just now', content: '' },
    PREVIEW_ARTIFACT: { id: 'preview', type: 'preview', title: 'Live Preview', status: 'complete', updatedAt: 'just now', content: '' },

    TASKS: [
      'Setting up the project and routing',
      'Building Scenario A: Admin workflow speed demo',
      'Building Scenario B: Teacher experience mockup',
      'Building Scenario C: Cluster visibility map',
      'Building the comparison dashboard',
      'Generating synthetic school and teacher data',
      'Building the concept narrative page',
      'End-to-end walkthrough and QA',
    ],
  },

  // ─── build ─────────────────────────────────────────────────────────────────

  build: {
    MSG_INTRO:
      "Alright — you want a working tool fast. I'll keep it focused: a simple two-sided booking system for your school's admin team and relief teachers. No cluster features, no dashboards for leadership — just the core loop done well. A few questions first.",

    MSG_AFTER_CLARIFY_1:
      "That's a clear, well-grounded problem. Let me now help you figure out what the right solution looks like.",

    MSG_AFTER_CLARIFY_2:
      "This is shaping up to be a focused, two-sided booking system — admin staff on one side posting jobs, relief teachers on the other accepting them. Your Requirements Brief is ready.",

    MSG_QUALITY_APPROVED:
      "Looks good. Let me ask a few implementation questions so I can generate a plan with accurate time estimates.",

    MSG_QUALITY_REJECTED:
      "What needs changing? Tell me what's off.",

    MSG_AFTER_QUALITY_REVISION:
      "Updated. Does this match what you had in mind?",

    MSG_AFTER_IMPL:
      "Based on your answers, here's the build plan. Review the steps and timings, then confirm you're okay with the data handling approach.",

    MSG_ACK_APPROVED:
      "Confirmed. Building now — I'll work through each task.",

    MSG_ACK_REJECTED:
      "No problem. Check the hosting requirements and come back when you're ready.",

    MSG_AFTER_ACK_REVISION:
      "Noted. Data handling approach is unchanged. Ready to build.",

    MSG_BUILD_COMPLETE:
      "Your prototype is ready. All 8 tasks completed — booking flow, notifications, confirmation screens, and sample data are all in place. Share the link with your admin team when you're ready to try it.",

    MSG_RESOLUTION_APPROVED:
      "Great — share the link with your team. They can start using it for real bookings.",

    MSG_RESOLUTION_REJECTED:
      "What needs tweaking? Tell me and I'll fix it.",

    MSG_AFTER_RESOLUTION_REVISION:
      "Done. Ready to share now?",

    CLARIFY_1: BUILD_CLARIFY_1,
    CLARIFY_2: BUILD_CLARIFY_2,
    IMPL_QS: BUILD_IMPL_QS,

    ACK_APPROVE_LABEL: 'Yes, I accept and will proceed',
    ACK_REJECT_LABEL: 'I need to check with my team first',
    RESOLUTION_APPROVE_LABEL: 'Yes, share with the team',
    RESOLUTION_REJECT_LABEL: 'Not quite there yet',

    BRIEF_V1: BUILD_BRIEF_V1,
    BRIEF_V2: BUILD_BRIEF_V2,
    IMPL_PLAN: BUILD_IMPL_PLAN,
    IMPL_PLAN_REVISED: BUILD_IMPL_PLAN_REVISED,
    ACK_REVIEW: BUILD_ACK_REVIEW,
    RESOLUTION_CONTENT: BUILD_RESOLUTION_CONTENT,

    BRIEF_ARTIFACT: { id: 'brief', type: 'brief', title: 'Project Brief', status: 'in-progress', updatedAt: 'just now', content: BUILD_BRIEF_V1 },
    IMPL_PLAN_ARTIFACT: { id: 'impl-plan', type: 'implementation', title: 'Implementation Plan', status: 'in-progress', updatedAt: 'just now', content: BUILD_IMPL_PLAN },
    PROTOTYPE_ARTIFACT: { id: 'prototype', type: 'prototype', title: 'Prototype', status: 'complete', updatedAt: 'just now', content: '' },
    PREVIEW_ARTIFACT: { id: 'preview', type: 'preview', title: 'Live Preview', status: 'complete', updatedAt: 'just now', content: '' },

    TASKS: [
      'Setting up project structure and routing',
      'Building the admin job posting form',
      'Building the relief teacher notification view',
      'Building the one-tap accept / decline flow',
      'Building the booking confirmation screen',
      'Loading sample data — teachers, schools, subjects',
      'Connecting all screens into a complete flow',
      'Final review and launch',
    ],
  },
};
