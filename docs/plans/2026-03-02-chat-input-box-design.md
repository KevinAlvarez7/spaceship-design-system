# ChatInputBox Component — Design

**Date:** 2026-03-02
**Status:** Approved

## Purpose

A composed DS component that pairs a multiline text area with a bottom-right "Explore" button. Primary goal is to experiment with surface treatments — neo-brutalist vs professional — making the visual language of each treatment immediately legible through a single, purpose-built component.

## Figma References

- Professional: `node-id=11140-15189`
- Neo-brutalist: `node-id=8635-19780`

File: `zQJPNvrvj9fbrSZMXk4mgt`

## Layout

```
┌──────────────────────────────────────────┐  ← container (surface controls this)
│                                          │
│  [textarea — grows vertically]           │
│                                          │
│                        [ Explore ↑ ]     │  ← button, bottom-right
└──────────────────────────────────────────┘
```

- Container: `flex flex-col`, `gap-3`, `p-3`
- Textarea: `flex-1 w-full`, transparent bg, no border, body-base text, placeholder color
- Submit row: `flex justify-end`
- Button: "Explore" label + arrow icon (↑ professional, → neo-brutalist)

## Surface Variants

| Property | `professional` | `neo-brutalist` |
|---|---|---|
| Container border | none | `border-2 border-[var(--border-default)]` |
| Container shadow | `var(--shadow-border)` | `var(--shadow-neo-brutalist)]` |
| Container radius | `var(--radius-sm)` | `var(--radius-sm)` |
| Button surface | `professional` (shadow-border) | `neo-brutalist` (border + shadow-hard) |
| Button icon | up-arrow ↑ | right-arrow → |

## Component API

```tsx
export interface ChatInputBoxProps {
  surface?: 'professional' | 'neo-brutalist';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}
```

## Token Usage

- Container shadow: `--shadow-border` / `--shadow-neo-brutalist`
- Container border: `--border-default` (neo-brutalist only)
- Textarea text: `--text-primary`
- Textarea placeholder: `--text-placeholder`
- Textarea bg: `--bg-input-default`
- Button: reuses `Button` component with `variant="primary"` + matching `surface`

## Architecture

- **Location:** `components/ui/chat-input-box.tsx`
- **Pattern:** Single CVA component, `surface` prop controls container + button treatment
- **Button:** Reuse existing `Button` DS component (`variant="primary"`, `size="md"`, `surface` passed through)
- **Icon:** Inline SVG arrow — no icon library dependency
- **Approach:** Option A — single self-contained component

## Files Affected

| File | Action |
|---|---|
| `components/ui/chat-input-box.tsx` | Create |
| `components/ui/index.ts` | Add export |
| `app/components/[component]/ChatInputBoxPage.tsx` | Create viewer page |
| `components/viewer/Sidebar.tsx` | Add nav entry |
