import type { Artifact } from './artifactData';
import type { ClarificationQuestion } from '@/components/ui';

// ─── User message ─────────────────────────────────────────────────────────────

export const USER_MESSAGE =
  `Build me a relief teacher booking system for schools.`;

// ─── Assistant messages ───────────────────────────────────────────────────────

export const ASSISTANT_INTRO =
  `A relief teacher booking system — got it. Before I start building, I want to make sure we're solving the right problem. Let me ask you a few questions to understand what's actually going wrong today.`;

export const ASSISTANT_AFTER_STEP_1 =
  `That's a clear, well-grounded problem. Let me now help you figure out what the right solution looks like.`;

export const ASSISTANT_AFTER_STEP_2 =
  `This is shaping up to be a focused, two-sided booking system — admin staff on one side posting jobs, relief teachers on the other accepting them. I'm updating your Project Brief now.`;

export const ASSISTANT_AFTER_STEP_3 =
  `Perfect. I'm generating a Security Review based on your answers and starting the build now. I'll run through each task as I complete it.`;

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

// ─── Step 3 — Implementation confirmation (4 questions) ──────────────────────

export const STEP_3_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'rank',
    label: 'For the prototype, what should I prioritise building?',
    items: [
      'The admin job posting flow',
      'The relief teacher notification and accept/decline flow',
      'The confirmation screen both parties see after booking',
      'The availability calendar for relief teachers',
    ],
  },
  {
    type: 'single',
    label: 'What device should the prototype be optimised for?',
    options: [
      'Mobile — most users will be on their phones',
      'Desktop — admin staff use school computers',
      'Both — needs to work across devices',
    ],
  },
  {
    type: 'multi',
    label: 'What should the prototype include for the testing session?',
    options: [
      'Sample data — pre-filled relief teachers, schools, and subjects',
      'A realistic job posting scenario with a fake absent teacher',
      'A view showing what the relief teacher sees on their phone',
      'A confirmation screen with full job details',
      'An error state — what happens if no teacher accepts within 30 minutes',
    ],
  },
  {
    type: 'single',
    label: 'Are you ready to proceed?',
    options: [
      'Yes — build the prototype',
      'I want to adjust the Project Brief first',
      'Start with just the admin flow for now',
    ],
  },
];

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
- **Confirmation to both parties** — Both admin staff and the relief teacher receive a confirmation with full job details.`;

export const BRIEF_CONTENT_V3 = `${BRIEF_CONTENT_V2}

## Build Plan

### Phase 1 — POC (4 weeks)
Validate the core booking flow works end to end. Success: 5 admin staff and 10 relief teachers complete the full flow without confusion or errors.

### Phase 2 — POV (6 weeks)
Test with a full school cluster and measure operational impact. Success: Average booking time drops below 10 minutes; zero double-bookings.

### Phase 3 — MVP (8 weeks)
Stable, supported product ready for broader rollout. Success: Adopted by at least 2 clusters with no critical issues in first 4 weeks.

## Testing Plan

### Hypothesis
We believe school admin staff will be able to post a relief job and receive a confirmed teacher in **under 5 minutes** using the prototype, because the current process has no structure and the bottleneck is coordination — not availability.

### Success Criteria
- **80%** of test users complete the end-to-end flow without assistance
- Median time from job posting to confirmation is under **5 minutes**
- All participants report they would use this over the current WhatsApp process

### Method
Moderated usability testing with 5 admin staff and 8 relief teachers across 2 pilot schools.

## What We're Asking For

Funding and **4 weeks** to build and test a proof-of-concept for a digital relief teacher booking system across 2 pilot schools.

## Validation Results

We've built a working prototype and tested it with **5 admin staff** and **8 relief teachers** across 2 schools.

### Results
- **82%** of users completed the full booking flow without assistance
- Median booking time was **4 minutes 20 seconds** vs current **45 minutes**
- All test users said they would use this over the current process

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

// ─── Security Review artifact ─────────────────────────────────────────────────

export const SECURITY_ARTIFACT: Artifact = {
  id: 'security',
  type: 'security',
  title: 'Security Review',
  status: 'in-progress',
  updatedAt: 'just now',
  content: `# Security Review
**Relief Teacher Booking System**
Generated by Spaceship · Ministry of Education · March 2026

---

## Current Status

> ✅ **No external services are connected.** This prototype operates entirely within Spaceship's self-contained environment. All data is mock data generated for testing purposes only. No real personal data is stored, transmitted, or processed.
>
> This prototype handles information up to **Restricted / Sensitive Normal (R/SN)** classification. It is not cleared for Confidential, Secret, or above. Do not enter data above R/SN into this prototype at any stage.

---

## ⚠️ External Services Warning

The services listed below are **not implemented** in this prototype and have not been requested or configured by Spaceship.

**If you prompt Spaceship to build, connect, or integrate any service of this type, it will be automatically flagged in this document and in your Project Brief. Please proceed at your own risk.**

| Service Type | Examples | Status |
|---|---|---|
| Authentication / identity providers | Singpass, Auth0, Okta, Firebase Auth | Not implemented |
| Push notification services | Firebase Cloud Messaging (FCM), Apple Push Notification Service (APNs), OneSignal | Not implemented |
| SMS gateways | Twilio, Vonage, Infobip, AWS SNS | Not implemented |
| Email delivery services | SendGrid, Mailgun, AWS SES, Postmark | Not implemented |
| Cloud storage | AWS S3, Google Cloud Storage, Azure Blob Storage, Supabase Storage | Not implemented |
| Analytics and tracking | Google Analytics, Mixpanel, Amplitude, Segment | Not implemented |
| Error monitoring | Sentry, Datadog, New Relic, LogRocket | Not implemented |
| Payment services | Stripe, PayPal, Adyen, Braintree | Not implemented |
| AI / LLM APIs | OpenAI, Google Gemini, Cohere, Hugging Face | Not implemented |
| CRM / productivity | Salesforce, HubSpot, Notion, Airtable | Not implemented |

---

## Third-Party Integrations (if requested in future)

If any of the above services are added, they will be logged here with a risk assessment before being permitted to proceed.

| Service | Purpose | Data Sent Out | Risk Level | Notes |
|---|---|---|---|---|
| Singpass / NDI | User authentication | NRIC token to NDI servers for verification | Low | Approved WOG platform. Follow NDI developer guidelines. IM8 compliant. |
| Push notification service (FCM / APNs) | Notify relief teachers of new jobs | Device token + message payload (includes school name, date, time) | Medium | Send a generic notification only. Load job details in-app. Sensitive scheduling data must not leave the MOE environment. Requires IM8 review before production. |
| WOG SMS Service (GovTech) | SMS fallback for teachers without the app | Teacher mobile number + job summary | Medium | Use GovTech's approved WOG SMS service only. Do not use commercial SMS gateways (Twilio, Vonage, etc.) without explicit data governance approval. |

---

## Data Classification

| Data Type | Contents | Classification | Requirement |
|---|---|---|---|
| Relief teacher personal details | Name, NRIC, mobile number, availability schedule | R/SN — PII | Store within MOE-approved infrastructure only. Deletable on request per PDPA obligations. |
| Booking and assignment records | Teacher name, school, date, subject assigned | Internal | Retain for payroll reconciliation. Access limited to authorised admin staff and school leaders. |
| Admin staff activity log | Who posted which job, at what time | Internal audit trail | Retain minimum 12 months. Not accessible to relief teachers. |

---

## Internal Risks

| Risk | Impact | Mitigation | Risk Level |
|---|---|---|---|
| Relief teacher's phone is lost or shared | Another person accepts or declines jobs on their behalf | Session timeout after 15 minutes. Singpass re-authentication required to accept a job. | Low |
| Admin staff post a job with incorrect details | Relief teacher arrives at wrong school or teaches wrong subject | Confirmation screen before posting. 15-minute edit window. Cancellation triggers immediate notification to assigned teacher. | Low |
| System unavailable when teacher calls in sick | Admin staff fall back to WhatsApp, defeating the purpose | Target 99.5% uptime. Graceful error messaging. Offline mode not required for POC — review for MVP. | Medium |

---

## Clearance by Stage

| Stage | Clearance Status |
|---|---|
| Prototype user testing | ✅ Clear — no real data, no external connections |
| POC live deployment | ⚠️ Requires IM8 system classification and basic security review |
| POV with real users | ⚠️ Requires Singpass integration approval and PDPA data handling plan |
| MVP production | 🔴 Requires full IM8 compliance review and GovTech security sign-off |`,
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
  'Building the one-tap accept/decline flow',
  'Building the booking confirmation screen',
  'Loading sample data — teachers, schools, subjects',
  'Connecting all screens into a complete flow',
  'Final review and launch',
];
