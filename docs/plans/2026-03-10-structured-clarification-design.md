# Structured Clarification Page — Design Doc

**Date:** 2026-03-10
**Status:** Approved
**URL:** `/patterns/structured-clarification`

---

## Purpose

A hardcoded prototype for team demos and user testing. Demonstrates a sequential, stage-gated clarification flow using pill-based single/multi-select inputs and a drag-to-reorder priority list. No AI calls — all state is local.

---

## Architecture

### File Layout

```
app/patterns/[pattern]/
  StructuredClarificationPage.tsx   ← server component (no async), registered in page.tsx
  StructuredClarificationDemos.tsx  ← "use client", all interactive logic
```

### Registration

- `viewer-registry.ts`: section `Pages`, route `patterns`, layout `standard`, `experiment: true`
- Slug: `structured-clarification`, title: `Structured Clarification`
- URL: `/patterns/structured-clarification`
- Add to `PATTERNS` map in `app/patterns/[pattern]/page.tsx`

---

## Component Interfaces

Structured for future extraction to `components/patterns/ClarificationCard.tsx`. When extracted, move the 4 named exports (`SingleSelect`, `MultiSelect`, `RankPriorities`, `ClarificationCard`) and update the import path — no logic changes needed.

```ts
type SingleSelectQuestion   = { type: 'single'; label: string; options: string[];  required?: boolean }
type MultiSelectQuestion    = { type: 'multi';  label: string; options: string[];  required?: boolean }
type RankPrioritiesQuestion = { type: 'rank';   label: string; items: string[] }
type Question = SingleSelectQuestion | MultiSelectQuestion | RankPrioritiesQuestion

type Stage = {
  title: string
  questions: Question[]
}

// question index → selected value(s)
type StageAnswers = Record<number, string | string[]>

// ClarificationCard props
type ClarificationCardProps = {
  stage: Stage
  onSubmit: (answers: StageAnswers) => void
}
```

---

## Stage Data

Three hardcoded stages as a typed `Stage[]` constant:

**Stage 1 — Problem Clarification**
- [SingleSelect, required] "Who is the primary user?" → Government officer / Admin & ops / Public citizen / Internal developer
- [MultiSelect, required] "What pain points does this solve?" → Too many manual steps / Hard to find information / Process takes too long / Errors from copy-pasting / No visibility into status

**Stage 2 — Solution Clarification**
- [SingleSelect, required] "What will this feature produce?" → A form / A dashboard / An automated action / A report or export
- [MultiSelect, required] "Which constraints apply?" → Must work on mobile / WCAG AA accessible / No new backend / Fits existing design system

**Stage 3 — Implementation Confirmation**
- [RankPriorities] "Rank what matters most" → Correctness / Speed of delivery / Visual polish / Edge case handling / Test coverage
- [SingleSelect, required] "Ready to proceed?" → Yes, build it / Let me adjust the plan / Start with a skeleton only

---

## Interaction Model

- `currentStage: number` (0–2) and `submittedAnswers: StageAnswers[]` track state
- Stage N only renders after stage N-1 is submitted
- On submit: stage collapses into a read-only `StageSummary` (title + Q→A chips); stage N+1 slides in with a spring animation
- **Continue button disabled** until all `required` questions have ≥1 answer selected
- `RankPriorities` is always considered answered (initial order is valid)
- No back-navigation (linear flow)

---

## Drag-to-Reorder (RankPriorities)

- `@dnd-kit/core` + `@dnd-kit/sortable` (install as new dependency)
- Each item: position number (1-based), `GripVertical` drag handle (lucide), label text
- Position numbers update live during drag
- On `DragEndEvent`: reorder the items array; new order = the answer

---

## DS Token Usage

| Element | Token |
|---------|-------|
| Card background | `bg-(--bg-surface-default)` |
| Card border/shadow | `shadow-(--shadow-border)` surface |
| Selected pill bg | `bg-(--bg-interactive-primary-default)` |
| Selected pill text | `text-(--text-inverse)` |
| Unselected pill bg | `bg-(--bg-interactive-secondary-default)` |
| Unselected pill text | `text-(--text-primary)` |
| Continue button | `<Button variant="primary" size="md">` |
| Spring animation | `springs.interactive` from `@/tokens` |

Rules: no Tailwind color utilities, no hardcoded hex, all semantic tokens.

---

## Constraints

- No `dark:` variants — theming via `[data-theme="dark"]` on `<html>`
- No inline `style={{ }}` for token values — use className paren syntax
- Patterns compose exclusively from `@/components/ui` — no raw HTML where a DS component exists
- `"use client"` boundary in Demos file only; Page file is a plain sync function
