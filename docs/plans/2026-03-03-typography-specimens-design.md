# Typography Specimens — Design Doc

**Date:** 2026-03-03

## Goal

Replace the current flat `typeSpecimens` list with a fully-specified 14-specimen type scale organised into 5 groups, add JetBrains Mono as a new font family token, and update the typography viewer page to render one `<Preview>` block per group.

---

## Type Scale

### Displays (Zilla Slab Bold)

| Name      | Size            | Line Height         |
|-----------|-----------------|---------------------|
| display-1 | 6xl — 60px      | 6.25rem — 100px     |
| display-2 | 5xl — 48px      | 4.5rem  — 72px      |
| display-3 | 4xl — 36px      | 4xl     — 40px      |

### Headings (Outfit Bold)

| Name | Size          | Line Height    |
|------|---------------|----------------|
| h1   | 3xl — 30px    | 3xl — 36px     |
| h2   | 2xl — 24px    | 2xl — 32px     |
| h3   | xl  — 20px    | xl  — 28px     |
| h4   | lg  — 18px    | lg  — 28px     |
| h5   | base — 16px   | base — 24px    |

### Body (Outfit Regular)

| Name      | Size        | Line Height  |
|-----------|-------------|--------------|
| body-lg   | lg — 18px   | lg — 28px    |
| body-base | base — 16px | base — 24px  |
| body-sm   | sm — 14px   | sm — 20px    |

### Captions (Outfit SemiBold)

| Name      | Size        | Line Height  |
|-----------|-------------|--------------|
| caption-1 | base — 16px | sm — 20px    |
| caption-2 | sm — 14px   | sm — 20px    |
| caption-3 | xs — 12px   | xs — 16px    |

### Code (JetBrains Mono Regular)

| Name   | Size        | Line Height  |
|--------|-------------|--------------|
| code-1 | base — 16px | base — 24px  |
| code-2 | sm — 14px   | sm — 20px    |

---

## Token Changes

### `styles/tokens.css`

- Add `--font-family-mono: 'JetBrains Mono', monospace;`
- Update `--line-height-5xl` from `1` (auto) to `4.5rem` (72px)
- Update `--line-height-6xl` from `1` (auto) to `6.25rem` (100px)

### `app/globals.css`

- Add `--font-family-mono` to the `@theme` block as `font-mono`

### `app/layout.tsx`

- Import `JetBrains_Mono` from `next/font/google`
- Load weights `['400', '600']`, bind variable to `--font-family-mono`
- Apply variable class to `<body>`

### `tokens/typography.ts`

- Add `{ name: 'mono', cssVar: '--font-family-mono', value: 'JetBrains Mono, monospace' }` to `fontFamilies`
- Update `lineHeights` entries for `5xl` and `6xl` to reflect new values
- Replace `typeSpecimens: TypeSpecimen[]` with:
  ```ts
  export type TypeSpecimenGroup = {
    group: string;
    specimens: TypeSpecimen[];
  };
  export const typeSpecimenGroups: TypeSpecimenGroup[];
  ```

---

## Typography Page (`app/typography/page.tsx`)

- Import `typeSpecimenGroups` instead of `typeSpecimens`
- Render one `<Preview label={group.group}>` block per group
- Within each Preview, same row layout: 80px label column + rendered text

---

## Out of Scope

- No changes to existing DS components
- No changes to semantic colour or spacing tokens
- `fontSizes`, `fontWeights` token arrays unchanged
