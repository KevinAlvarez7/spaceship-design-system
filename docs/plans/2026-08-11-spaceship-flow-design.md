# Spaceship Flow — Design Doc

**Date:** 2026-08-11
**Status:** Flow specification — approved. Components not yet built.
**Scope:** Landing → Problem Crafter → Prototype Builder & Tester → Report Card

---

## 1. Premise

An **AI co-pilot for problem-solving**. A user arrives with a vague problem. The co-pilot
interrogates it into a sharp problem statement, builds a prototype against that statement, tests
the prototype, and scores the result in a report card.

The four flows are **sequential stages of one journey**, not independent tools. State accumulates:
every stage adds an artifact, and earlier artifacts stay reachable.

> **Design intent: the flow is the deliverable.** Stage transitions, artifact accumulation, and
> the sense of forward motion matter more than pixel fidelity on any single screen. The UI must
> be present and must follow every DS primitive — but it does not need to be finished.

---

## 2. Decisions

| Question | Decision |
|---|---|
| Premise | AI co-pilot for problem-solving; stages are sequential |
| Canvas interaction | **Pan + zoom only. Nodes are NOT draggable.** |
| Storybook wiring | One story, internal state machine |
| Artifacts | Problem statement · Prototype · Test results / report card |
| Layout | Chat left, artifacts right |
| Approval Card | **Prototype stage only** — the Problem Crafter has no approval gate |
| Report Card | Overall score + per-dimension scores |

### Why "no node dragging" matters

It removes the largest implementation risk in the entire build. Pan + zoom without node dragging
is a transform wrapper plus wheel and pointer handlers — roughly 60 lines. **No `reactflow`, no
`@xyflow/react`, no `d3`, no new dependency of any kind.** The repo has no canvas or graph library
today and does not need one.

---

## 3. Layout

### 3.1 Landing

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                   ✦  SpaceshipLogoScene                  │
│                                                          │
│              What problem are we solving?                │
│                                                          │
│        ┌────────────────────────────────────────┐        │
│        │  ChatInputBox                          │        │
│        │  "Explore any problems, prototype…"    │        │
│        │                            [ Explore ] │        │
│        └────────────────────────────────────────┘        │
│                                                          │
│         [ suggestion ]  [ suggestion ]  [ … ]            │
│                                                          │
└──────────────────────────────────────────────────────────┘
        GridBackground behind everything · centered
```

### 3.2 All later stages — chat left, artifacts right

```
┌───────────────────────────┬──────────────────────────────────────────┐
│  ChatPanel                │  ArtifactPanelV2                         │
│  35rem fixed              │  flex-1                                  │
│  (--sizing-chat-panel)    │                                          │
│                           │  ┌────────┬────────┬────────┬────────┐   │
│  ┌─────────────────────┐  │  │Problem │Mindmap │Proto…  │Report  │   │
│  │ EditableTitle    ⋯  │  │  └────────┴────────┴────────┴────────┘   │
│  └─────────────────────┘  │  ┌──────────────────────────────────┐    │
│                           │  │                                  │    │
│   ChatMessage (assistant) │  │   artifact body                  │    │
│                           │  │   — markdown, or                 │    │
│         ChatBubble (user) │  │   — Mindmap canvas, or           │    │
│                           │  │   — ReportCard                   │    │
│   ChatMessage             │  │                                  │    │
│                           │  │                                  │    │
├───────────────────────────┤  │                                  │    │
│  footer slot:             │  │                                  │    │
│   · ChatInputBox      or  │  │                                  │    │
│   · ClarificationCard or  │  │                                  │    │
│   · ApprovalCard          │  └──────────────────────────────────┘    │
│  (+ TaskList addon)       │                                          │
└───────────────────────────┴──────────────────────────────────────────┘
```

`ChatPanel` already implements this footer slot with exactly this precedence
(`approval` → `clarification` → `input`). **No new ChatPanel props are required by this flow.**

Below the `md` breakpoint the two panes swap to a single column via `lib/use-media-query.ts`,
matching how the existing `docs/pages/*Page.tsx` prototypes already behave.

---

## 4. State machine

```
                              ┌─────────┐
                              │ landing │
                              └────┬────┘
                                   │ ChatInputBox submit
                                   ▼
                          ┌─────────────────┐
                          │ crafter-thinking│   Thinking + ThinkingLogo
                          └────────┬────────┘
                                   ▼
                          ┌─────────────────┐
                          │   crafter-q1    │   ClarificationCard  (who / context)
                          └────────┬────────┘
                                   │ onSubmit
                                   ▼
                          ┌─────────────────┐
                          │   crafter-q2    │   ClarificationCard  (constraints / success)
                          └────────┬────────┘
                                   │ onSubmit
                                   ▼
                          ┌─────────────────┐
                          │crafter-synthesis│   mindmap nodes appear, staggered
                          └────────┬────────┘
                                   ▼
                          ┌─────────────────┐
                          │  crafter-done   │   Problem Statement artifact complete
                          └────────┬────────┘
                                   │ user: "Build a prototype"
                                   ▼
                          ┌─────────────────┐
                          │  builder-plan   │   ◄── ApprovalCard — THE ONLY GATE
                          └───┬─────────┬───┘
                  Request     │         │  Approve
                  changes     │         │
                              ▼         │
                  ┌─────────────────┐   │
                  │ builder-rejected│   │      revised plan → ApprovalCard again
                  └────────┬────────┘   │
                           └────────────┤
                                        ▼
                              ┌─────────────────┐
                              │ builder-building│   TaskList via footerAddon
                              └────────┬────────┘
                                       ▼
                              ┌─────────────────┐
                              │ builder-preview │   Prototype artifact
                              └────────┬────────┘
                                       │ user: "Test it"
                                       ▼
                              ┌─────────────────┐
                              │  tester-running │   Thinking
                              └────────┬────────┘
                                       ▼
                              ┌─────────────────┐
                              │ tester-results  │   Test Results artifact
                              └────────┬────────┘
                                       │ user: "Score it"
                                       ▼
                              ┌─────────────────┐
                              │     report      │   ReportCard artifact
                              └─────────────────┘
```

### Transition triggers

| From | Trigger | To |
|---|---|---|
| `landing` | `ChatInputBox` submit | `crafter-thinking` |
| `crafter-thinking` | timer (~1.2s) | `crafter-q1` |
| `crafter-q1` | `ClarificationCard.onSubmit` | `crafter-q2` |
| `crafter-q2` | `ClarificationCard.onSubmit` | `crafter-synthesis` |
| `crafter-synthesis` | timer (~1.5s, nodes stagger in) | `crafter-done` |
| `crafter-done` | `ChatInputBox` submit | `builder-plan` |
| `builder-plan` | `ApprovalCard.onReject` | `builder-rejected` |
| `builder-rejected` | timer → revised plan | `builder-plan` |
| `builder-plan` | `ApprovalCard.onApprove` | `builder-building` |
| `builder-building` | task ticks complete | `builder-preview` |
| `builder-preview` | `ChatInputBox` submit | `tester-running` |
| `tester-running` | timer | `tester-results` |
| `tester-results` | `ChatInputBox` submit | `report` |

`builder-rejected` is the only branch. It exists because the request-changes path is the most
interesting interaction in `ApprovalCard` and a flow demo that never exercises it undersells the
component.

---

## 5. Artifact tabs — progressive disclosure

| Phase | Tabs visible | Newly added |
|---|---|---|
| `landing` | *(no artifact panel)* | — |
| `crafter-thinking` … `crafter-q2` | Problem Statement | Problem Statement (draft) |
| `crafter-synthesis` | Problem Statement · Mindmap | **Mindmap** |
| `crafter-done` | Problem Statement · Mindmap | — (statement → complete) |
| `builder-plan` … `builder-preview` | + Prototype | **Prototype** |
| `tester-running` · `tester-results` | + Test Results | **Test Results** |
| `report` | + Report Card | **Report Card** |

**Tabs appearing mid-flow is the primary signal of forward progress.** `ArtifactPanelV2` already
supports `changedIds` (blinking red dot on a changed tab) and a content-change shimmer sweep —
both should be driven, not rebuilt. When a phase adds an artifact, also auto-select its tab.

---

## 6. Component matrix

### Existing — used as-is, no changes

| Component | Path | Role |
|---|---|---|
| `ChatPanel` | `components/patterns/ChatPanel.tsx` | Left rail. Footer slots already sufficient. |
| `ChatThread` / `ChatMessage` / `ChatBubble` | `components/ui/` | Thread content (`bare` inside ChatPanel) |
| `ChatInputBox` | `components/ui/chat-input-box.tsx` | Free-text advance |
| `ClarificationCard` | `components/ui/clarification-card.tsx` | Q&A rounds |
| `ApprovalCard` | `components/ui/approval-card.tsx` | The single prototype gate |
| `TaskList` | `components/ui/task-list.tsx` | Build progress, via `footerAddon` |
| `Thinking` / `ThinkingLogo` | `components/ui/thinking.tsx` | Inter-phase pauses |
| `ArtifactPanelV2` + `FolderTabs` | `components/patterns/` | Right pane tabs |
| `Tag` | `components/ui/tag.tsx` | Status pills |
| `GridBackground` | `components/effects/GravityWell/GridBackground.tsx` | Landing backdrop |
| `SpaceshipLogoScene` | `components/effects/SpaceshipLogo/SpaceshipLogoScene.tsx` | Landing mark |

### Extended

| File | Change |
|---|---|
| `components/patterns/artifact-types.ts` | Add `'problem' \| 'mindmap' \| 'report'` to `ArtifactType`; extend `ARTIFACT_TYPE_LABEL`, `ARTIFACT_STATUS_VARIANT`, `ARTIFACT_STATUS_LABEL` |
| `components/patterns/ArtifactContentRenderer.tsx` | Add `mindmap` → `<Mindmap>` and `report` → `<ReportCard>` branches to the existing type switch |

### New — DS (`components/ui/`)

| Component | File | Notes |
|---|---|---|
| `CanvasViewport` | `canvas-viewport.tsx` | Pan + zoom shell. **No node drag.** |
| `CanvasCard` | `canvas-card.tsx` | Mindmap node. `variant × state × surface`. |
| `ReportCard` + `ScoreRow` | `report-card.tsx` | Overall + dimension scores |
| `ArtifactCard` | `artifact-card.tsx` | Card form of an `Artifact` |

### New — Patterns (`components/patterns/`)

| Component | File | Notes |
|---|---|---|
| `Mindmap` | `Mindmap.tsx` | `CanvasViewport` + `CanvasCard` + SVG edge layer |
| `FlowShell` | `FlowShell.tsx` | Chat-left / artifacts-right frame + centered landing variant |

`FlowShell` is worth extracting: all seven existing `docs/pages/*Page.tsx` prototypes
re-implement this split inline. It is the highest-leverage cleanup in this work.

---

## 7. New component specs

All follow the house contract, verified against `button.tsx`, `approval-card.tsx`, and
`feedback-form.tsx`:

- CVA base as a **string array**, one concern per line
- A **`surface` axis** — `default | shadow-border` (Button's `flat | shadow` is the sole exception)
- `disableMotion` prop with a genuine static branch
- `{...props}` spread **before** explicit motion props
- `willChange: 'transform'` on scale animations; spring damping ratio ζ ≥ 0.7
- **Tailwind v4 paren syntax** — `bg-(--token)`, never `bg-[var(--token)]`
- `[font-size:var(--font-size-sm)]` and `[font-weight:var(--font-weight-semibold)]` to avoid the
  `tailwind-merge` collapse traps
- Named export + exported variants fn + registered in `components/ui/index.ts`

### 7.1 `CanvasViewport`

```
┌─────────────────────────────────────────────┐
│  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·  │  dot-grid backdrop
│    ┌──────────┐                             │
│    │ CanvasCard│──────┐                      │  ← single transformed layer:
│    └──────────┘      │                      │    cards + SVG edges share
│  ·   ·   ·   ·  ┌────▼─────┐   ·   ·   ·  · │    one coordinate space
│                 │CanvasCard│                │
│                 └──────────┘                │
│  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·  │
│                                    ┌─┬─┬─┐  │
│                                    │+│−│⌖│  │  zoom in / out / reset
└────────────────────────────────────┴─┴─┴─┘──┘
```

| Prop | Type | Notes |
|---|---|---|
| `children` | `ReactNode` | Rendered into the transformed layer |
| `minZoom` / `maxZoom` | `number` | Default `0.5` / `2` |
| `initialZoom` | `number` | Default `1` |
| `showGrid` | `boolean` | Dot-grid backdrop |
| `surface` | `'default' \| 'shadow-border'` | |
| `disableMotion` | `boolean` | Static branch renders untransformed at `initialZoom` |

Behaviour: wheel → zoom **about the pointer** (not the origin — zooming to the top-left feels
broken); pointer-drag on empty background → pan; `cursor-grab` / `cursor-grabbing`. Node dragging
is explicitly not implemented — pointer events on `CanvasCard` must not initiate a pan.

### 7.2 `CanvasCard`

Axes: `variant` (`problem | insight | assumption | evidence`), `state`
(`default | selected | muted`), `surface`. `compoundVariants` drive the `surface × state` border
and shadow switch — exactly the multi-axis case the DS checklist calls for.

Absolutely positioned by its parent. **The card owns no layout maths.**

### 7.3 `ReportCard`

```
┌────────────────────────────────────────────┐
│  Report Card                    ┌────────┐ │
│  Relief Teacher Booking         │   78   │ │  overall
│                                 │ /100   │ │
│                                 └────────┘ │
├────────────────────────────────────────────┤
│  Desirability          ████████░░   82     │
│  Strong signal from relief teachers…       │
├────────────────────────────────────────────┤
│  Feasibility           ███████░░░   71     │
│  Integrates with existing MOE systems…     │
├────────────────────────────────────────────┤
│  Viability             ████████░░   80     │
│  Cost per booking falls below…             │
└────────────────────────────────────────────┘
```

`ReportCard` + `ScoreRow`. Reuses `Tag` for status pills.
**Read `components/playground/readiness-gate/ReadinessScoreCard.tsx` first** — it is the closest
precedent, and lifting what transfers avoids inventing a second scoring idiom in the same system.

### 7.4 `ArtifactCard`

Title · type label · status `Tag` · `updatedAt` · content snippet.
Reuses `ARTIFACT_TYPE_LABEL` / `ARTIFACT_STATUS_VARIANT` / `ARTIFACT_STATUS_LABEL` from
`artifact-types.ts`. **Do not duplicate those maps.**

### 7.5 `Mindmap`

```
                    ┌─────────────┐
                    │  PROBLEM    │           nodes: fixed x/y from mock data
                    │  (root)     │           edges: cubic béziers, SVG layer
                    └──┬───┬───┬──┘                  beneath the cards
             ┌─────────┘   │   └─────────┐
             ▼             ▼             ▼
      ┌───────────┐ ┌───────────┐ ┌───────────┐
      │ insight   │ │ assumption│ │ evidence  │
      └─────┬─────┘ └───────────┘ └───────────┘
            ▼
      ┌───────────┐
      │ insight   │
      └───────────┘
```

Props: `nodes: MindmapNode[]`, `edges: MindmapEdge[]`, `selectedId?`, `onSelect?`.

**Layout is authored in mock data, not computed.** No force-directed solver — that is scope this
flow does not need.

---

## 8. Tokens

Add to `styles/tokens.css`, then mirror the groups in `tokens/colors.ts` using the ` / `
hierarchy separator.

| Token | Purpose |
|---|---|
| `--bg-surface-canvas` | Canvas backdrop |
| `--border-canvas-edge` | Mindmap connector stroke |
| `--bg-surface-info-primary` / `-secondary` / `-tertiary` / `-base` | The only missing status surface family — brand, success, error, and warning all exist; info does not |

### ⚠️ Dark-mode gap — must be addressed, not papered over

`--bg-status-*` and `--text-status-*` currently have **no `[data-theme="dark"]` overrides**.
The Report Card and Canvas Cards lean on status colours heavily, so **they will read
light-on-light in dark mode.**

Add dark overrides for the status families actually consumed. Per `CLAUDE.md`, only override
where the dark value genuinely differs from the light alias — do not re-declare the whole set.

Reuse as-is: `--sizing-chat-panel` (35rem) for the chat rail, `springs.*` / `scales.*` from
`@/tokens`, `--shadow-border` / `--shadow-border-hover`.

---

## 9. Mock data

**`lib/mocks/spaceship-flow.mock.ts`**, following `lib/mocks/clarification-chat.mock.ts`
(430 lines — read it first, it is the template).

| Export | Type | Consumed by |
|---|---|---|
| `USER_OPENING` | `string` | `landing` → `crafter-thinking` |
| `ASSISTANT_INTRO` | `string` | `crafter-thinking` |
| `CRAFTER_Q1` | `ClarificationQuestion[]` | `crafter-q1` |
| `CRAFTER_Q2` | `ClarificationQuestion[]` | `crafter-q2` |
| `ASSISTANT_AFTER_Q1` / `_Q2` | `string` | between rounds |
| `MINDMAP_NODES` | `MindmapNode[]` | `crafter-synthesis` onward — hand-authored `x`/`y` |
| `MINDMAP_EDGES` | `MindmapEdge[]` | ditto |
| `PROBLEM_STATEMENT_CONTENT` | `string` (markdown) | Problem Statement artifact |
| `PROTOTYPE_PLAN` | `ApprovalPlan` | `builder-plan` |
| `PROTOTYPE_PLAN_REVISED` | `ApprovalPlan` | `builder-rejected` → re-gate |
| `BUILD_TASKS` | `string[]` | `TaskList` during `builder-building` |
| `PROTOTYPE_CONTENT` | `string` | Prototype artifact |
| `TEST_RESULTS` | `string` (markdown) | Test Results artifact |
| `REPORT_OVERALL` | `number` | `ReportCard` |
| `REPORT_DIMENSIONS` | `{ label, score, rationale }[]` | `ReportCard` |
| `artifactsForPhase(phase)` | `(p: Phase) => Artifact[]` | drives tab disclosure |

**Hold one concrete scenario across all four stages.** The existing mocks use a *Relief Teacher
Booking System*; continuing that domain is what makes the flow read as one journey rather than
four disconnected screens.

---

## 10. Flow page + stories

**`components/docs/pages/SpaceshipFlowPage.tsx`** — the `Phase` union as `useState`, following
`NewProjectFlowPage.tsx` (723 lines) as the reference idiom. Composes `FlowShell` + `ChatPanel` +
`ArtifactPanelV2`. Accepts `initialPhase?: Phase` so any stage is directly addressable.

| Story file | Title |
|---|---|
| `stories/playground/SpaceshipFlow.stories.tsx` | `Playground/Prototypes/Spaceship Flow` |
| `stories/ui/CanvasViewport.stories.tsx` | `Components/CanvasViewport` |
| `stories/ui/CanvasCard.stories.tsx` | `Components/CanvasCard` |
| `stories/ui/ReportCard.stories.tsx` | `Components/ReportCard` |
| `stories/ui/ArtifactCard.stories.tsx` | `Components/ArtifactCard` |
| `stories/patterns/Mindmap.stories.tsx` | `Patterns/Mindmap` |

Story contract, verified against `Button.stories.tsx` and `ApprovalCard.stories.tsx`:
`satisfies Meta<typeof X>`; `tags: ['autodocs']`; `argTypes` categorised
`Variants` / `State` / `Motion`; `...EXCLUDE_MOTION_PROPS` **last** and **only** for components
extending `HTMLMotionProps`; and a `Composition` story using `CompositionTable` +
`CompositionEntry` + `sourcePath`, which is near-universal in this repo.

The flow story uses `parameters: { layout: 'fullscreen' }`.

---

## 11. Out of scope

- **Chat Panel / Q&A UI / Approval Card visual restyles.** Blocked on Figma (see §13). The flow
  exercises all three as-is; the restyle is a clean follow-up that will not fight this work.
- Node dragging, force-directed layout, canvas minimap.
- Real persistence, routing, or backend. All state is `useState`; all data is mock.

---

## 12. Verification

1. `npm run lint` — no new warnings
2. `npx storybook build` — clean static build. **This is the real typecheck**; there is no
   separate `tsc` script.
3. `npm run dev` → `Playground/Prototypes/Spaceship Flow` → click **landing → report with no dead
   end**. This is the actual acceptance test.
4. Toggle the Storybook **dark theme on every stage** — this is where the missing `--bg-status-*`
   dark overrides surface. Check deliberately, not in passing.
5. Canvas: wheel-zoom, background-drag-pan, and confirm **nodes do not drag**.
6. Token audit on every changed file:
   ```
   grep -n "#[0-9a-fA-F]\{3,6\}\|text-zinc\|bg-white\|border-gray\|text-white\|bg-\[var(" <file>
   ```
   The trailing `bg-\[var(` catches v3 bracket syntax — the most common slip in this codebase.
7. Confirm every new `components/ui/` entry is exported from `components/ui/index.ts` and has a story.

---

## 13. Figma — blocked, and why

The Figma MCP could not read any of the seven linked nodes this session.

- Authenticated as `kevinalvarez373@gmail.com`
- That account holds a **View seat** on the GovTech Singapore org, where the file lives
- Figma gates **all** MCP read tools (`get_screenshot`, `get_metadata`, `get_design_context`,
  `get_variable_defs`) behind an edit-capable seat
- Every call returned: *"Looks like you don't have edit access to this file."*
- Re-authorising mid-session did not propagate — `whoami` still returned the personal account and
  node `11524:7920` still errored. **A session restart is required.**

### Linked nodes, still unread

| Frame | Node |
|---|---|
| Chat Panel | `11524-7920` |
| Q&A UI | `12034-66861` |
| Approval Card UI | `11524-7921` |
| Artifacts Tabs, Cards & Panels | `11524-7926` |
| Canvas, Mindmap, Canvas Cards | `12061-108350` |
| New Pages / Flow | `12062-123845` |

### Open questions for the post-restart session

1. **Chat Panel** — what changed visually? Current implementation has a sticky header with
   noise-textured gradient masks and a sticky footer with slot swapping.
2. **Q&A UI** — is this a restyle of `ClarificationCard`, or closer to `ClarificationCardKeycap`?
   Both exist and share the `useClarificationState` engine.
3. **Approval Card** — the current component has a drag-resize handle and an always-mounted
   morphing reject button. Do both survive the redesign?
4. **Canvas Cards** — confirm the `variant` set. This doc assumes
   `problem | insight | assumption | evidence`.
5. **Report Card** — confirm the dimension list. This doc assumes
   desirability / feasibility / viability.
6. **Artifacts Tabs** — does `11524-7926` supersede `FolderTabs`, or is it `FolderTabsV2`?

---

## 14. Sequencing

1. **This doc lands and is committed** — it is a repo file, so it survives the session restart.
2. Restart the session with GovTech credentials.
3. Next session reads this doc, pulls the real Figma frames, and executes §7–§10 with design
   context in hand.
4. The three restyles in §11 fold in once their frames are readable.
