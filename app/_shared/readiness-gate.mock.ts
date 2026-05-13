import type { Artifact } from '@/components/patterns/artifact-types';
import type { ClarificationQuestion } from '@/components/ui';
import type { AssumptionRow } from '@/components/playground/readiness-gate/ReadinessScoreCard';

// ─── Officer prompts ─────────────────────────────────────────────────────────

export const RG_USER_MESSAGE =
  `We're about to launch the renewal redesign. Want to check the readiness before shipping.`;

export const RG_ASSISTANT_INTRO =
  `Good — pre-commit is the cheapest place to catch unvalidated assumptions. I'll walk you through each one. For each: validated, partially validated, or unvalidated. Add evidence links where you have them.`;

export const RG_ASSISTANT_AFTER_CHECKLIST =
  `Compiling the readiness report — checking which assumptions have enough evidence to ship behind.`;

export const RG_ASSISTANT_AFTER_IMPACT =
  `Here's the predicted impact per citizen segment. Now the gate decision: do we ship, or do we go back for evidence?`;

export const RG_ASSISTANT_AFTER_APPROVE =
  `Readiness report locked. Service cleared to ship — with the noted follow-up measurements planned for the partially-validated assumptions.`;

export const RG_ASSISTANT_AFTER_BLOCKED =
  `Blocked — at least one critical assumption is unvalidated. Below are the assumptions that need evidence before shipping. Take them back into EvidenceStudio.`;

// ─── Assumption checklist (rendered as sequential ClarificationCards) ────────

export const RG_ASSUMPTION_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'A1 — Seniors abandon the renewal flow because of jargon on the residential-status screen',
    options: [
      'Validated — 5 senior responses, 4 cited jargon as the blocker',
      'Partially validated — strong qualitative signal, no funnel data yet',
      'Unvalidated — we still believe it, but haven\'t tested it',
    ],
  },
  {
    type: 'single',
    label: 'A2 — Rewriting the labels in plain language will recover most of the drop-off',
    options: [
      'Validated — A/B test shows redesign reduces drop-off by 35%',
      'Partially validated — usability test was positive, no production data yet',
      'Unvalidated — we assumed this without testing',
    ],
  },
  {
    type: 'single',
    label: 'A3 — Seniors are our most-affected segment',
    options: [
      'Validated — segment-by-segment funnel data confirms it',
      'Partially validated — anecdotal and frontline staff agree, no funnel breakdown yet',
      'Unvalidated — we picked this segment without evidence',
    ],
  },
  {
    type: 'single',
    label: 'A4 — The new design doesn\'t introduce new accessibility blockers',
    options: [
      'Validated — accessibility audit done, two issues fixed',
      'Partially validated — informal review, no formal audit',
      'Unvalidated — we haven\'t reviewed accessibility yet',
    ],
  },
  {
    type: 'single',
    label: 'A5 — The redesign won\'t break for citizens with non-standard documentation',
    options: [
      'Validated — interviewed 3 citizens with edge-case documentation, all completed the new flow',
      'Partially validated — covered in usability test but not for edge cases',
      'Unvalidated — we haven\'t tested this segment',
    ],
  },
];

// ─── Sample rows for phase-jump stories ──────────────────────────────────────

export const RG_DEFAULT_ROWS: AssumptionRow[] = [
  {
    id:           'a1',
    label:        'Seniors abandon the renewal flow because of jargon',
    status:       'validated',
    evidenceNote: '5 senior responses · 4 cited jargon · cross-checked with funnel',
  },
  {
    id:           'a2',
    label:        'Plain-language labels will recover the drop-off',
    status:       'validated',
    evidenceNote: 'A/B test: 35% reduction in drop-off (n = 412)',
  },
  {
    id:           'a3',
    label:        'Seniors are the most-affected segment',
    status:       'partial',
    evidenceNote: 'Frontline staff agree; funnel breakdown still pending',
  },
  {
    id:           'a4',
    label:        'No new accessibility blockers introduced',
    status:       'validated',
    evidenceNote: 'Accessibility audit complete; 2 issues found and fixed',
  },
  {
    id:           'a5',
    label:        "Won't break for citizens with edge-case documentation",
    status:       'partial',
    evidenceNote: '3 interviews completed; broader coverage planned post-launch',
  },
];

export const RG_BLOCKED_ROWS: AssumptionRow[] = [
  ...RG_DEFAULT_ROWS.slice(0, 3),
  {
    id:           'a4',
    label:        'No new accessibility blockers introduced',
    status:       'unvalidated',
    evidenceNote: 'No audit performed — required before ship',
  },
  {
    id:           'a5',
    label:        "Won't break for citizens with edge-case documentation",
    status:       'unvalidated',
    evidenceNote: 'No coverage; needs at least 3 interviews',
  },
];

// ─── Readiness report artifact ───────────────────────────────────────────────

export const RG_REPORT_CONTENT = `## Readiness Report — Citizen Renewal Redesign

**Summary:** Ready to ship · 3 validated · 2 partially validated · 0 unvalidated

---

### Assumption status

| ID | Assumption | Status | Evidence |
|---|---|---|---|
| A1 | Jargon causes drop-off | Validated | 5 senior responses, 4 cited jargon, cross-checked with funnel |
| A2 | Plain-language labels recover drop-off | Validated | A/B test: 35% reduction (n = 412) |
| A3 | Seniors are most-affected segment | Partially validated | Frontline agreement; funnel breakdown pending |
| A4 | No new accessibility blockers | Validated | Audit complete; 2 issues fixed |
| A5 | Holds for edge-case documentation | Partially validated | 3 interviews complete; broader coverage post-launch |

---

### Decision rationale

The two partially-validated assumptions (A3 and A5) are not load-bearing for the primary segment. We're shipping with planned follow-up measurements:

- **A3** — Pull segment-by-segment drop-off rates two weeks post-launch; widen test if seniors over-index relative to assumption.
- **A5** — Run 10 more edge-case interviews within the first month.

---

### What we'd still bet against

- If post-launch drop-off doesn't fall by at least 20%, revisit A2 — the plain-language hypothesis may be incomplete.
- If frontline staff start hearing new questions, A1 may need re-framing.

---

### Sign-off

Officer · ${new Date().toISOString().slice(0, 10)}`;

export const RG_REPORT_ARTIFACT: Artifact = {
  id: 'rg-report',
  type: 'security',
  title: 'Readiness Report',
  status: 'complete',
  updatedAt: 'just now',
  content: RG_REPORT_CONTENT,
};
