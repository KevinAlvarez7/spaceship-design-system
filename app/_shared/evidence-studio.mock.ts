import type { Artifact } from '@/components/patterns/artifact-types';
import type { ClarificationQuestion } from '@/components/ui';

// ─── Officer-side prompts ────────────────────────────────────────────────────

export const ES_USER_MESSAGE =
  `My hypothesis: seniors abandon the renewal flow because the residential-status options aren't in plain language. Help me plan how to test it.`;

export const ES_ASSISTANT_INTRO =
  `That's a falsifiable hypothesis — good. Before we ship anything, we should design evidence that could prove us wrong. Let's pick the methods: which signals would change your mind the most?`;

export const ES_ASSISTANT_AFTER_METHODS =
  `Got it. I'll generate the validation plan and a task list. Once you're ready, launch the citizen survey — the responses will land here as evidence.`;

export const ES_ASSISTANT_PLAN_READY =
  `Here's the validation plan and the tasks broken out. Hit "Launch citizen survey" when you're ready to start collecting responses.`;

export const ES_ASSISTANT_SURVEY_LAUNCHED =
  `Survey launched. Watching for responses now.`;

export const ES_ASSISTANT_EVIDENCE_LOG_READY =
  `Survey closed — five responses landed. I've grouped them into supports / contradicts / inconclusive against your hypothesis. Three responses support the original assumption (jargon barrier), one contradicts (works fine for that segment), one is mixed. Strong enough signal to warrant a redesign attempt — weak enough that you should plan a follow-up measurement after launch.`;

// ─── Method-selection questions ──────────────────────────────────────────────

export const ES_METHOD_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'multi',
    label: 'Which methods will give us the strongest signal?',
    options: [
      'Intercept survey at the service centre (5-min quick rating + tags)',
      '3 senior interviews — sit with them through the existing flow',
      'Dropout-funnel data pull from the analytics platform',
      'Frontline staff focus group — what questions do they hear most?',
      'Existing complaint logs — code by problem type',
    ],
  },
  {
    type: 'single',
    label: "What's the smallest evidence base that would change your mind?",
    options: [
      'One clear-cut interview where a senior breezes through the flow',
      '20+ survey responses with a low pain-point rating',
      'Dropout data showing the issue is at a different step',
      'Frontline staff saying the most common question is something else',
      'Others',
    ],
    freeText: true,
  },
];

// ─── Validation tasks (TaskList) ─────────────────────────────────────────────

export const ES_VALIDATION_TASKS = [
  'Drafting the citizen survey questions',
  'Recruiting 5 service-centre intercepts',
  'Launching the survey to the cohort',
  'Collecting and tagging responses',
  'Cross-checking against the dropout funnel',
  'Writing up the evidence log',
];

// ─── Validation Plan artifact ────────────────────────────────────────────────

export const ES_PLAN_CONTENT = `## Validation Plan — Residential-Status Jargon Hypothesis

**Hypothesis under test:** Seniors abandon the renewal flow because the residential-status options aren't in plain language.

---

### Methods (in order of strength)
1. **Senior intercept survey at service centre** — 5-min rating + tag picker. Target: 20 responses, ~3 days at one site.
2. **3 contextual interviews** — sit with a senior through the existing flow. Look for where they pause, ask, or give up. ~45 min each.
3. **Dropout-funnel data pull** — confirm the drop-off concentrates on the residential-status screen (or doesn't). 1 day to extract.

### What would change our minds
- A senior breezes through the existing flow in an interview (one clear case is enough).
- Survey rating > 3.5 on average for our segment (suggests not a usability cliff).
- Dropout data shows drop-off concentrates somewhere else (e.g. document upload).

### Risks
- Service-centre intercept skews to citizens already struggling — supplement with online responders.
- 3 interviews is qualitative-only; pair with the survey count.

---

### Owner
Officer (this prototype) · ~5 working days end-to-end`;

export const ES_PLAN_ARTIFACT: Artifact = {
  id: 'es-plan',
  type: 'research',
  title: 'Validation Plan',
  status: 'in-progress',
  updatedAt: 'just now',
  content: ES_PLAN_CONTENT,
};

// ─── Evidence Log artifact ───────────────────────────────────────────────────

export const ES_EVIDENCE_LOG_CONTENT = `## Evidence Log — Residential-Status Jargon Hypothesis

**Status:** 5 responses logged · 3 support · 1 contradicts · 1 inconclusive

---

### Summary

The pain signal is real but narrower than we framed it. Three of five seniors flagged the residential-status step specifically. One went through without trouble. One mentioned button-size and missing back navigation — different problem, same screen.

---

### Quote table

| Citizen | Signal | Topic | Quote |
|---|---|---|---|
| Mei Ling, 38, Tampines | Supports | Jargon barrier | "I had to Google what 'residential status' meant in this context." |
| Rajesh, 67, Bedok | Supports | No back navigation | "When I made a mistake on page two, I had to start from the beginning." |
| Aisyah, 45, Toa Payoh | Contradicts | Works fine | "Works fine for me. I do it once a year." |
| Daniel, 29, Yishun | Inconclusive | Wizard vs single-page | "I'd rather have a single page than a wizard." |
| Priya, 52, Jurong East | Supports | Jargon barrier | "I had to read every screen twice to be sure I picked the right option." |

---

### Recommendation

Strong enough signal to test a redesign of the residential-status screen. **Don't ship the redesign without a control** — run an A/B with the existing screen so we can measure whether jargon is actually the load-bearing problem or just the most visible one.

Take this evidence log into **ReadinessGate** before any decision to ship.`;

export const ES_EVIDENCE_LOG_ARTIFACT: Artifact = {
  id: 'es-evidence',
  type: 'research',
  title: 'Evidence Log',
  status: 'complete',
  updatedAt: 'just now',
  content: ES_EVIDENCE_LOG_CONTENT,
};
