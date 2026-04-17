# FeedbackForm Component — Design

**Date:** 2026-04-15

## Context

The ApprovalCard component contains a "Request Changes" interaction: a trigger button that morphs into an inline textarea form via `AnimatePresence` + `layoutId`. This pattern is useful beyond the approval context, so we're extracting it into a standalone, simpler component called `FeedbackForm`.

**Simplifications vs. ApprovalCard:** No drag-resize, no approve row, no `useAnimation` color controls, no ScrollArea.

## Behavior

- Collapsed: single trigger button (e.g. "Request Changes")
- On click: trigger morphs into a form container (textarea + Cancel/Submit buttons)
- Cancel: collapses back to trigger
- Submit: reads textarea value, fires `onSubmit`, collapses

## Animation

- `MotionConfig transition={springs.gentle}` — layout animation default
- `LayoutGroup` — scopes `layoutId="feedback-btn"`
- `AnimatePresence mode="popLayout" initial={false}` — swaps trigger ↔ form
- Trigger/form fade via `springs.snappy`
- Submit button shares `layoutId` with trigger for continuous morph
- `layout="position"` on labels to prevent text stretch
- `willChange: 'transform'` on morphing submit button
- `disableMotion` path: plain elements, instant swap

## API

```typescript
interface FeedbackFormProps extends VariantProps<typeof feedbackFormVariants> {
  onSubmit?: (message?: string) => void;
  onCancel?: () => void;
  submitLabel?: string;       // 'Request Changes'
  placeholder?: string;       // 'Describe the changes you'd like...'
  disableMotion?: boolean;
  className?: string;
}
```

## CVA

- `feedbackFormVariants`: `surface: 'default' | 'shadow-border'` (default: `'shadow-border'`)
- Local `triggerVariants`: `role: 'trigger' | 'submit'` + `hasShadow`

## Composition

- Cancel: `<Button variant="secondary" surface="flat" size="md">`
- Submit: raw `motion.button` with `layoutId` (DS Button doesn't support layoutId)
- Icons: `Pencil` (trigger), `ArrowUp` (submit)
- Textarea: uncontrolled via ref

## Files

| Action | File |
|--------|------|
| Create | `components/ui/feedback-form.tsx` |
| Modify | `components/ui/index.ts` |
| Create | `stories/ui/FeedbackForm.stories.tsx` |
