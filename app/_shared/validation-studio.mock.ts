import type { Artifact } from '@/components/patterns/artifact-types';

// ─── Officer prompts ─────────────────────────────────────────────────────────

export const VS_USER_MESSAGE =
  `I want to redesign the citizen renewal flow. Take me end to end — frame the hypothesis, plan the evidence, gather it, and decide whether to ship.`;

export const VS_ASSISTANT_INTRO =
  `Good — let's do this properly. Before we touch the design, we'll frame the hypothesis (who, problem, assumption, falsifier), plan the validation methods, collect evidence from real citizens, and only ship when each load-bearing assumption has evidence behind it. I'll walk you through each gate.`;

export const VS_ASSISTANT_AFTER_FRAME =
  `Hypothesis brief is ready. Now let's plan how we'll test it — which methods, what signal would change our mind, what tasks fall out.`;

export const VS_ASSISTANT_AFTER_PLAN =
  `Validation plan and tasks generated. Launch the citizen survey when you're ready. I'll also pull up a citizen interview transcript from a previous session so we have both quant and qual signals.`;

export const VS_ASSISTANT_AFTER_EVIDENCE =
  `Evidence collected. Five survey responses, three interview snippets. Three of five citizens hit the jargon barrier on the residential-status screen. Strong enough to test a redesign — too narrow to skip a follow-up measurement after launch.`;

export const VS_ASSISTANT_READINESS =
  `Now the gate decision. I've assembled the readiness report — each load-bearing assumption, its status, the evidence behind it. Review and approve, or send unvalidated assumptions back for more evidence.`;

export const VS_ASSISTANT_AFTER_APPROVE =
  `Approved. Service is cleared to ship. The two partially-validated assumptions get follow-up measurements scheduled — I'll add those to the launch plan.`;

export const VS_ASSISTANT_AFTER_REJECT =
  `Understood — sending unvalidated assumptions back to EvidenceStudio for more coverage. No service ships on faith.`;

export const VS_ASSISTANT_BUILD_COMPLETE =
  `Service launched · follow-up measurements scheduled for week 2 and week 4 · citizens notified.`;

// ─── Build-phase tasks ────────────────────────────────────────────────────────

export const VS_BUILD_TASKS = [
  'Finalizing the redesigned residential-status screen',
  'Re-running the accessibility audit',
  'Wiring up the follow-up measurement scripts',
  'Scheduling week-2 funnel pull',
  'Scheduling week-4 edge-case interviews',
  'Pushing the service live',
];

// ─── Combined brief artifact ──────────────────────────────────────────────────

export const VS_BRIEF_CONTENT_V1 = `## Hypothesis Brief — Citizen Renewal Redesign

### Who
**Seniors who renew once a year and find the flow unfamiliar.**

### Problem
They don't understand what the residential-status options mean in plain language.

### Biggest assumption
**That rewriting the labels will recover most of the drop-off.**

### How we'd know we're wrong
- Redesign + no change in drop-off.
- Seniors complete the existing flow when we sit with them.
- The problem turns out to be in a segment we haven't profiled.`;

export const VS_BRIEF_CONTENT_V2 = `${VS_BRIEF_CONTENT_V1}

---

### Validation methods picked
1. Service-centre intercept survey · 20 responses target
2. 3 senior interviews · contextual, ~45 min each
3. Dropout-funnel data pull · confirms or contradicts the step-3 hypothesis`;

export const VS_BRIEF_ARTIFACT: Artifact = {
  id: 'vs-brief',
  type: 'brief',
  title: 'Hypothesis Brief',
  status: 'in-progress',
  updatedAt: 'just now',
  content: VS_BRIEF_CONTENT_V1,
};

// ─── Plan artifact ────────────────────────────────────────────────────────────

export const VS_PLAN_CONTENT = `## Validation Plan — Renewal Redesign

### Methods (in priority)
1. **Intercept survey at service centre** · 20 senior responders · ~3 days
2. **3 contextual interviews** · sit with seniors through the existing flow · ~45 min each
3. **Dropout-funnel pull** · confirm step-3 concentration

### What changes our minds
- One clear interview where a senior breezes through (one case is enough).
- Average rating > 3.5 across the survey.
- Funnel shows drop-off concentrates at a different step.

### Owner
Officer · 5 working days end-to-end`;

export const VS_PLAN_ARTIFACT: Artifact = {
  id: 'vs-plan',
  type: 'research',
  title: 'Validation Plan',
  status: 'in-progress',
  updatedAt: 'just now',
  content: VS_PLAN_CONTENT,
};

// ─── Evidence log artifact ────────────────────────────────────────────────────

export const VS_EVIDENCE_LOG_CONTENT = `## Evidence Log — Renewal Redesign

**Status:** 5 survey responses · 3 interview snippets · 6 of 8 cited jargon as the blocker.

| Citizen | Source | Signal | Topic |
|---|---|---|---|
| Mei Ling, 38, Tampines | Interview | Supports | Jargon barrier |
| Mei Ling, 38, Tampines | Survey | Supports | Took too long |
| Rajesh, 67, Bedok | Interview | Supports | No back navigation |
| Rajesh, 67, Bedok | Survey | Supports | Needed help |
| Aisyah, 45, Toa Payoh | Survey | Contradicts | Works fine |
| Daniel, 29, Yishun | Interview | Inconclusive | Wizard vs single-page |
| Daniel, 29, Yishun | Survey | Supports | Unclear what to do next |
| Priya, 52, Jurong East | Survey | Supports | Confusing |

### Pattern
The jargon barrier is real and concentrated on the residential-status screen. Drop-off appears to be a usability cliff, not a context-of-use mismatch — five distinct citizens flagged the same step.

### Caveats
- Two responses surfaced *secondary* problems (back-navigation, wizard structure) that the redesign doesn't address.
- Aisyah's "works fine" response is from a segment we haven't profiled deeply — worth a follow-up.`;

export const VS_EVIDENCE_LOG_ARTIFACT: Artifact = {
  id: 'vs-evidence',
  type: 'research',
  title: 'Evidence Log',
  status: 'complete',
  updatedAt: 'just now',
  content: VS_EVIDENCE_LOG_CONTENT,
};

// ─── Readiness artifact ───────────────────────────────────────────────────────

export const VS_READINESS_CONTENT = `## Readiness Report — Renewal Redesign

**Summary:** Ready to ship · 3 validated · 2 partially validated · 0 unvalidated

| ID | Assumption | Status | Evidence |
|---|---|---|---|
| A1 | Jargon causes drop-off | Validated | 6/8 citizens, cross-checked with funnel |
| A2 | Plain-language labels recover drop-off | Validated | A/B test: 35% reduction (n = 412) |
| A3 | Seniors are the most-affected segment | Partially validated | Frontline agreement; segment funnel pending |
| A4 | No new accessibility blockers | Validated | Audit complete; 2 issues fixed |
| A5 | Holds for edge-case documentation | Partially validated | 3 interviews; broader coverage post-launch |

### Decision rationale
Two partial-validation items have explicit follow-up measurements scheduled. No unvalidated assumptions blocking ship.

### Post-launch measurement
- Week 2: segment-by-segment drop-off pull
- Week 4: 10 edge-case interviews

### Sign-off
Officer · ${new Date().toISOString().slice(0, 10)}`;

export const VS_READINESS_ARTIFACT: Artifact = {
  id: 'vs-readiness',
  type: 'security',
  title: 'Readiness Report',
  status: 'complete',
  updatedAt: 'just now',
  content: VS_READINESS_CONTENT,
};
