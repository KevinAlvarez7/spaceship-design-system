import type { Artifact } from '@/components/patterns/artifact-types';
import type { ClarificationQuestion } from '@/components/ui';

// ─── Officer-side prompts ─────────────────────────────────────────────────────

export const HL_USER_MESSAGE =
  `I want to make the citizen renewal flow easier. People keep abandoning it halfway through.`;

export const HL_ASSISTANT_INTRO =
  `That's a useful starting point — but "easier" is a big word, and it covers a lot of different problems. Before we pick a fix, let's frame the hypothesis properly: who is struggling, what's specifically going wrong for them, what we're assuming, and what would tell us we're wrong.`;

export const HL_ASSISTANT_AFTER_WHO =
  `Good — you've picked the citizen segment. Now let's get specific about the problem and our biggest assumption. These two questions are where most validation work goes wrong: officers conflate "the user struggles" with "the user struggles because of X" and ship a fix for the wrong X.`;

export const HL_ASSISTANT_AFTER_PROBLEM =
  `That's a clear, testable framing. Now the most important question: what would we need to see to know we're wrong about this? If you can't answer that, the hypothesis isn't falsifiable — it's just an opinion with extra steps.`;

export const HL_ASSISTANT_AFTER_FALSIFIER =
  `Hypothesis brief ready. This is the artifact you'd bring into EvidenceStudio to plan the validation work — or share with a teammate to pressure-test before you invest in evidence.`;

// ─── Clarification questions ─────────────────────────────────────────────────

export const HL_WHO_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Which citizen segment is most affected?',
    options: [
      'Seniors who renew once a year and find the flow unfamiliar',
      'Working parents juggling renewal alongside work and childcare',
      'New residents who don\'t know which option applies to them',
      'Anyone with non-standard documentation (lost ID, name change, etc.)',
      'Others',
    ],
    freeText: true,
  },
  {
    type: 'multi',
    label: 'What signals tell you this segment is struggling?',
    options: [
      'High drop-off rate at a specific step',
      'Repeated calls to the service centre asking the same question',
      'Anecdotal complaints from frontline staff',
      'Survey scores trending down quarter over quarter',
      'Officer intuition — we hear about it but haven\'t measured it',
    ],
  },
];

export const HL_PROBLEM_ASSUMPTION_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'What is specifically going wrong for them?',
    options: [
      'They don\'t understand what each option means',
      'They don\'t have the right documents ready when they start',
      'They lose progress when they pause and come back later',
      'They reach the end and aren\'t sure if it submitted',
      'Others',
    ],
    freeText: true,
  },
  {
    type: 'single',
    label: 'What\'s the biggest assumption you\'re making about why?',
    options: [
      'That redesigning the form will fix it',
      'That clearer language will fix it',
      'That a single-page layout will fix it',
      'That the problem is the flow, not the underlying policy',
      'Others',
    ],
    freeText: true,
  },
];

export const HL_FALSIFIER_QUESTION: ClarificationQuestion[] = [
  {
    type: 'multi',
    label: 'How would you know you\'re wrong about this?',
    options: [
      'If we redesign the form and drop-off stays the same',
      'If users in our segment can complete the existing flow when we sit with them',
      'If the problem is more common in a segment we haven\'t looked at',
      'If frontline staff report different problems than the ones we listed',
      'If the policy itself is the blocker, not the interface',
    ],
  },
];

// ─── Hypothesis Brief artifact ───────────────────────────────────────────────

export const HL_BRIEF_CONTENT = `## Hypothesis Brief — Citizen Renewal Flow

### Who
**Seniors who renew once a year and find the flow unfamiliar.** Signals: drop-off concentrated at step 3 (document upload); frontline staff report repeated questions about which option applies; survey NPS for this segment has fallen three quarters running.

---

### Problem
They don't understand what each option on the residential-status screen means in plain language. They Google it, get confused, and abandon — or call the service centre.

---

### Biggest assumption
**That clearer language on the residential-status screen will fix it.**

If true: rewriting the labels and adding inline explanations will recover most of the drop-off.
If false: the problem is somewhere we haven't looked — the document checklist, the policy itself, or a different segment entirely.

---

### How we'd know we're wrong
- We redesign the screen and drop-off stays the same.
- Seniors complete the existing flow successfully when we sit with them (suggesting the issue is context, not language).
- Frontline staff tell us they hear different questions than the ones we picked.
- The problem turns out to be more common in a segment we haven't profiled.

---

### Next step
Take this brief into **EvidenceStudio** to plan the validation work — pick the methods (intercept survey at the service centre, 3 senior interviews, dropout-funnel data pull), define the success criteria, and assign tasks. Or pressure-test the framing with a teammate before investing.`;

export const HL_BRIEF_ARTIFACT: Artifact = {
  id: 'hl-brief',
  type: 'brief',
  title: 'Hypothesis Brief',
  status: 'complete',
  updatedAt: 'just now',
  content: HL_BRIEF_CONTENT,
};
