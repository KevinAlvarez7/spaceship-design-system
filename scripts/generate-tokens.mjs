/**
 * generate-tokens.mjs
 *
 * Reads /tmp/figma_vars.json and generates:
 *   - styles/tokens.css
 *   - tokens/colors.ts
 *   - tokens/spacing.ts
 *   - tokens/radius.ts
 *   - tokens/typography.ts
 *
 * Excluded collections (Tailwind Color/Dimension libraries):
 *   - VariableCollectionId:1:2  (Tailwind Colors, 244 vars)
 *   - VariableCollectionId:2:252 (Tailwind Dimensions, 49 vars)
 *
 * Run: node scripts/generate-tokens.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Load Figma data ──────────────────────────────────────────────────────────

const raw = readFileSync('/tmp/figma_vars.json', 'utf-8');
const figmaData = JSON.parse(raw);
const ALL_VARS = figmaData.meta.variables;
const ALL_COLS = figmaData.meta.variableCollections;

// ─── Collection IDs ───────────────────────────────────────────────────────────

const COL = {
  TAILWIND_COLORS:     'VariableCollectionId:1:2',
  TAILWIND_DIMENSIONS: 'VariableCollectionId:2:252',
  BRAND_PRIMITIVES:    'VariableCollectionId:8104:1178',
  COLOUR_SCHEME:       'VariableCollectionId:2108:508',
  PROJECT_COLOURS:     'VariableCollectionId:2106:486',
  TYPOGRAPHY:          'VariableCollectionId:102:524',
};

const EXCLUDED = new Set([COL.TAILWIND_COLORS, COL.TAILWIND_DIMENSIONS]);

// Special vars from excluded collections that map to named tokens we define
const WHITE_VAR_ID = 'VariableID:3:384';
const BLACK_VAR_ID = 'VariableID:3:385';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

function rgbaToCSS(r, g, b, a) {
  if (a >= 0.999) return rgbToHex(r, g, b);
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${Math.round(a * 100) / 100})`;
}

/** Build a map of varId → collectionId */
function buildVarToCollection() {
  const map = {};
  for (const [cid, col] of Object.entries(ALL_COLS)) {
    for (const vid of col.variableIds) {
      map[vid] = cid;
    }
  }
  return map;
}

const VAR_TO_COL = buildVarToCollection();


/** Get the terminal value of a variable, following alias chains */
function resolveToValue(varId) {
  const v = ALL_VARS[varId];
  if (!v) return null;
  const cid = VAR_TO_COL[varId];
  if (!cid) return null;
  const col = ALL_COLS[cid];
  const modeId = col.defaultModeId;
  const val = v.valuesByMode[modeId];

  if (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS') {
    return resolveToValue(val.id);
  }
  return val;
}

/** Get final hex/rgba for any variable (follows all aliases, returns hex string) */
function resolveHex(varId) {
  const val = resolveToValue(varId);
  if (!val) return '#000000';
  if (typeof val === 'object' && 'r' in val) {
    return rgbaToCSS(val.r, val.g, val.b, val.a ?? 1);
  }
  return String(val);
}

/**
 * Convert a brand primitive name to a CSS variable name.
 * "Orbit Blue/500" → "--orbit-blue-500"
 * "Nova Mint/200"  → "--nova-mint-200"
 */
function brandNameToCSSVar(name) {
  return '--' + name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');
}

/**
 * Build a map of varId → CSS var name for all non-excluded variables
 * that we define. This lets us emit var(--name) instead of resolved hex
 * when a semantic token references a non-excluded var.
 */
function buildCSSVarMap() {
  const map = {};

  // Brand primitives: Collection
  const brandCol = ALL_COLS[COL.BRAND_PRIMITIVES];
  for (const vid of brandCol.variableIds) {
    const v = ALL_VARS[vid];
    map[vid] = brandNameToCSSVar(v.name);
  }

  // Colour Scheme: primary-* and secondary-*
  const csCol = ALL_COLS[COL.COLOUR_SCHEME];
  for (const vid of csCol.variableIds) {
    const v = ALL_VARS[vid];
    map[vid] = `--${v.name}`;
  }

  // Named neutral vars we explicitly define
  map[WHITE_VAR_ID] = '--white';
  map[BLACK_VAR_ID] = '--black';

  return map;
}

const CSS_VAR_MAP = buildCSSVarMap();

/**
 * Get the CSS value to emit for a semantic token whose alias points to varId.
 * - If varId is in our CSS_VAR_MAP → `var(--that-var)`
 * - If varId is excluded → resolve to hex (or var(--white)/var(--black))
 */
function getSemanticValue(varId) {
  if (CSS_VAR_MAP[varId]) {
    return `var(${CSS_VAR_MAP[varId]})`;
  }
  // Excluded or unknown → inline hex
  return resolveHex(varId);
}

/**
 * Get the CSS value for a Project-Colours variable.
 * Follows one level of alias to get the referenced varId.
 */
function projectColourValue(varId) {
  const v = ALL_VARS[varId];
  if (!v) return '#000000';
  const cid = VAR_TO_COL[varId];
  const col = ALL_COLS[cid];
  const modeId = col.defaultModeId;
  const val = v.valuesByMode[modeId];

  if (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS') {
    return getSemanticValue(val.id);
  }
  // Direct value (overlays etc.)
  if (val && typeof val === 'object' && 'r' in val) {
    return rgbaToCSS(val.r, val.g, val.b, val.a ?? 1);
  }
  return String(val);
}

/**
 * Convert a project-colour Figma name to a CSS var name.
 * "text/primary"                     → "--text-primary"
 * "bg/surface/base"                  → "--bg-surface-base"
 * "bg/interactive/primary/default"   → "--bg-interactive-primary-default"
 * "bg/input/defa ult" (typo)         → "--bg-input-default"
 */
function projectNameToCSSVar(name) {
  return '--' + name
    .replace(/\s+/g, '') // remove accidental whitespace (typos in Figma)
    .toLowerCase()
    .replace(/\//g, '-');
}

// ─── Section generators ───────────────────────────────────────────────────────

/** Generate brand primitive CSS vars from the Collection */
function generateBrandPrimitives() {
  const col = ALL_COLS[COL.BRAND_PRIMITIVES];
  const modeId = col.defaultModeId;
  const lines = [];

  const scales = ['Orbit Blue', 'Cosmic Lilac', 'Lumen Yellow', 'Nova Mint', 'Solar Coral'];
  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

  for (const scale of scales) {
    lines.push(`\n  /* ${scale} */`);
    for (const shade of shades) {
      const name = `${scale}/${shade}`;
      // Find the var by name
      const vid = col.variableIds.find(id => ALL_VARS[id].name === name);
      if (!vid) { lines.push(`  /* ${name}: not found */`); continue; }
      const val = ALL_VARS[vid].valuesByMode[modeId];
      const hex = rgbToHex(val.r, val.g, val.b);
      const cssVar = brandNameToCSSVar(name);
      lines.push(`  ${cssVar}: ${hex};`);
    }
  }

  return lines.join('\n');
}

/** Generate neutral scale CSS vars (Zinc values from Tailwind Colors) */
function generateNeutralScale() {
  // Hard-coded Zinc values from Tailwind Colors (excluded collection)
  const zinc = {
    '50': '#fafafa', '100': '#f4f4f5', '200': '#e4e4e7', '300': '#d4d4d8',
    '400': '#a1a1aa', '500': '#71717a', '600': '#52525b', '700': '#3f3f46',
    '800': '#27272a', '900': '#18181b', '950': '#09090b',
  };

  const lines = [];
  for (const [shade, hex] of Object.entries(zinc)) {
    lines.push(`  --neutral-${shade}: ${hex};`);
  }
  lines.push('  --white: #ffffff;');
  lines.push('  --black: #000000;');
  return lines.join('\n');
}

/** Generate Colour Scheme alias vars */
function generateColourScheme() {
  const col = ALL_COLS[COL.COLOUR_SCHEME];
  const modeId = col.defaultModeId;
  const lines = [];

  for (const vid of col.variableIds) {
    const v = ALL_VARS[vid];
    const cssVar = `--${v.name}`;
    const val = v.valuesByMode[modeId];

    if (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS') {
      const targetId = val.id;
      const targetCid = VAR_TO_COL[targetId];

      if (EXCLUDED.has(targetCid)) {
        // secondary-* → point to neutral-*
        // We know secondary-N maps to Zinc/N (same shade)
        const shade = v.name.replace('secondary-', '');
        if (v.name.startsWith('secondary-')) {
          lines.push(`  ${cssVar}: var(--neutral-${shade});`);
        } else {
          // Unexpected: inline hex
          lines.push(`  ${cssVar}: ${resolveHex(targetId)};`);
        }
      } else {
        // primary-* → orbit-blue-*
        const cssVarTarget = CSS_VAR_MAP[targetId];
        if (cssVarTarget) {
          lines.push(`  ${cssVar}: var(${cssVarTarget});`);
        } else {
          lines.push(`  ${cssVar}: ${resolveHex(targetId)};`);
        }
      }
    } else {
      // Direct value
      if (val && 'r' in val) {
        lines.push(`  ${cssVar}: ${rgbaToCSS(val.r, val.g, val.b, val.a ?? 1)};`);
      } else {
        lines.push(`  ${cssVar}: ${val};`);
      }
    }
  }

  return lines.join('\n');
}

/** Generate Project-Colours semantic token CSS vars */
function generateProjectColours() {
  const col = ALL_COLS[COL.PROJECT_COLOURS];
  const lines = [];
  const seen = new Set(); // handle duplicate names (typo in Figma)

  for (const vid of col.variableIds) {
    const v = ALL_VARS[vid];
    const rawName = v.name;
    const cssVar = projectNameToCSSVar(rawName);

    // Skip duplicates (e.g. text/interactive/disabled appears twice)
    if (seen.has(cssVar)) continue;
    seen.add(cssVar);

    const value = projectColourValue(vid);
    lines.push(`  ${cssVar}: ${value};`);
  }

  return lines.join('\n');
}

/** Generate Typography CSS vars */
function generateTypography() {
  const col = ALL_COLS[COL.TYPOGRAPHY];
  const modeId = col.defaultModeId;
  const lines = [];

  // Font families (special mapping from Figma "type/*" names)
  lines.push('  /* Font Families */');
  lines.push("  --font-family-primary: 'Zilla Slab', Georgia, serif;");
  lines.push("  --font-family-secondary: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;");

  // Font sizes: convert px → rem
  lines.push('\n  /* Font Sizes */');
  const fontSizeVars = col.variableIds
    .filter(id => ALL_VARS[id].name.startsWith('font-size/'))
    .sort((a, b) => {
      const na = ALL_VARS[a].name;
      const nb = ALL_VARS[b].name;
      return na.localeCompare(nb, undefined, { numeric: true });
    });

  for (const vid of fontSizeVars) {
    const v = ALL_VARS[vid];
    const px = v.valuesByMode[modeId];
    const rem = px / 16;
    const suffix = v.name.replace('font-size/', '');
    lines.push(`  --font-size-${suffix}: ${rem}rem; /* ${px}px */`);
  }

  // Line heights: convert px → rem (100 → unitless 1)
  lines.push('\n  /* Line Heights */');
  const lineHeightVars = col.variableIds
    .filter(id => ALL_VARS[id].name.startsWith('line-height/'))
    .sort((a, b) => {
      const na = ALL_VARS[a].name;
      const nb = ALL_VARS[b].name;
      return na.localeCompare(nb, undefined, { numeric: true });
    });

  for (const vid of lineHeightVars) {
    const v = ALL_VARS[vid];
    const px = v.valuesByMode[modeId];
    const suffix = v.name.replace('line-height/', '');
    if (px === 100) {
      lines.push(`  --line-height-${suffix}: 1; /* auto / 100% */`);
    } else {
      const rem = px / 16;
      lines.push(`  --line-height-${suffix}: ${rem}rem; /* ${px}px */`);
    }
  }

  // Font weights
  lines.push('\n  /* Font Weights */');
  const weightMap = { thin: '100', regular: '400', semibold: '600', bold: '700' };
  const weightVars = col.variableIds.filter(id => ALL_VARS[id].name.startsWith('font-weight/'));
  for (const vid of weightVars) {
    const v = ALL_VARS[vid];
    const suffix = v.name.replace('font-weight/', '');
    const cssValue = weightMap[suffix] ?? v.valuesByMode[modeId];
    lines.push(`  --font-weight-${suffix}: ${cssValue};`);
  }

  return lines.join('\n');
}

/** Generate Spacing CSS vars (custom names from Fixed Tokens convention) */
function generateSpacing() {
  const entries = [
    ['0',   '0'],
    ['6xs', '0.125rem'], // 2px
    ['5xs', '0.25rem'],  // 4px
    ['4xs', '0.5rem'],   // 8px
    ['3xs', '0.75rem'],  // 12px
    ['2xs', '1rem'],     // 16px
    ['xs',  '1.25rem'],  // 20px
    ['sm',  '1.5rem'],   // 24px
    ['md',  '2rem'],     // 32px
    ['lg',  '2.5rem'],   // 40px
    ['xl',  '3rem'],     // 48px
    ['2xl', '4rem'],     // 64px
    ['3xl', '5rem'],     // 80px
    ['4xl', '6rem'],     // 96px
    ['5xl', '8rem'],     // 128px
  ];
  return entries.map(([name, value]) => `  --spacing-${name}: ${value};`).join('\n');
}

/** Generate Radius CSS vars (custom names) */
function generateRadius() {
  const entries = [
    ['none', '0'],
    ['xs',   '2px'],
    ['sm',   '4px'],
    ['md',   '6px'],
    ['lg',   '8px'],
    ['xl',   '12px'],
    ['2xl',  '16px'],
    ['3xl',  '24px'],
    ['full', '9999px'],
  ];
  return entries.map(([name, value]) => `  --radius-${name}: ${value};`).join('\n');
}

// ─── Build tokens.css ─────────────────────────────────────────────────────────

const tokensCss = `/* ============================================================
   SPACESHIP DESIGN SYSTEM — TOKEN FOUNDATION
   Generated by scripts/generate-tokens.mjs from Figma variables.
   Do not edit by hand — re-run the script to update.
   ============================================================ */

:root {

  /* ── Primitives — Brand Scales ───────────────────────────────
     Raw palette values. Never reference these in components.
     Use semantic tokens instead.
     ──────────────────────────────────────────────────────────── */
${generateBrandPrimitives()}

  /* ── Primitives — Neutral Scale (Zinc) ──────────────────────
     Basis for secondary-* and neutral surfaces.
     ──────────────────────────────────────────────────────────── */
${generateNeutralScale()}

  /* ── Aliases — Colour Scheme ────────────────────────────────
     primary-* → Orbit Blue, secondary-* → Neutral (Zinc)
     ──────────────────────────────────────────────────────────── */
${generateColourScheme()}

  /* ── Semantic — Project Colours ──────────────────────────────
     These are what components use. Map from Figma Project-Colours.
     ──────────────────────────────────────────────────────────── */
${generateProjectColours()}

  /* ── Typography ──────────────────────────────────────────────*/
${generateTypography()}

  /* ── Spacing (custom names) ──────────────────────────────────*/
${generateSpacing()}

  /* ── Radius (custom names) ───────────────────────────────────*/
${generateRadius()}

  /* ── Elevation ───────────────────────────────────────────────
     Not in Figma variables — maintained manually.
     ──────────────────────────────────────────────────────────── */
  --shadow-none: none;
  --shadow-sm:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-md:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 2px 4px -1px rgba(0, 0, 0, 0.08),
    0px 4px 8px rgba(0, 0, 0, 0.06);
  --shadow-lg:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 4px 8px -2px rgba(0, 0, 0, 0.12),
    0px 12px 24px rgba(0, 0, 0, 0.08);
  --shadow-xl:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 8px 16px -4px rgba(0, 0, 0, 0.16),
    0px 24px 48px rgba(0, 0, 0, 0.12);

  /* ── Motion ──────────────────────────────────────────────────
     Not in Figma variables — maintained manually.
     ──────────────────────────────────────────────────────────── */
  --duration-instant:  50ms;
  --duration-fast:     100ms;
  --duration-base:     200ms;
  --duration-slow:     300ms;
  --duration-slower:   500ms;

  --ease-linear:   linear;
  --ease-in:       cubic-bezier(0.4, 0, 1, 1);
  --ease-out:      cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ── Dark Mode ────────────────────────────────────────────────────
   Override semantic tokens only. Primitives never change.
   Derived by inverting scale direction on the neutral/primary axes.
   The Figma Project-Colours collection only has a Light mode;
   dark overrides are maintained manually here.
   ─────────────────────────────────────────────────────────────── */
[data-theme="dark"] {
  /* Text */
  --text-primary:   var(--secondary-50);
  --text-secondary: var(--secondary-400);
  --text-tertiary:  var(--secondary-500);
  --text-placeholder: var(--secondary-600);
  --text-inverse:   var(--black);
  --text-interactive-primary:   var(--primary-300);
  --text-interactive-secondary: var(--white);
  --text-interactive-disabled:  var(--neutral-600);

  /* Backgrounds */
  --bg-surface-base:      var(--neutral-950);
  --bg-surface-primary:   var(--neutral-900);
  --bg-surface-secondary: var(--neutral-800);
  --bg-surface-tertiary:  var(--neutral-700);

  /* Borders */
  --border-default: var(--neutral-700);
  --border-subtle:  var(--neutral-600);
  --border-input-default: var(--neutral-600);

  /* Elevation — dark adjustments */
  --shadow-sm:
    0px 0px 0px 1px rgba(255, 255, 255, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.4),
    0px 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md:
    0px 0px 0px 1px rgba(255, 255, 255, 0.06),
    0px 2px 4px -1px rgba(0, 0, 0, 0.5),
    0px 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg:
    0px 0px 0px 1px rgba(255, 255, 255, 0.06),
    0px 4px 8px -2px rgba(0, 0, 0, 0.6),
    0px 12px 24px rgba(0, 0, 0, 0.5);
}
`;

// ─── Build tokens/colors.ts ───────────────────────────────────────────────────


const BRAND_SCALES = [
  { label: 'Orbit Blue',    prefix: 'orbit-blue',    figmaName: 'Orbit Blue' },
  { label: 'Cosmic Lilac',  prefix: 'cosmic-lilac',  figmaName: 'Cosmic Lilac' },
  { label: 'Lumen Yellow',  prefix: 'lumen-yellow',  figmaName: 'Lumen Yellow' },
  { label: 'Nova Mint',     prefix: 'nova-mint',     figmaName: 'Nova Mint' },
  { label: 'Solar Coral',   prefix: 'solar-coral',   figmaName: 'Solar Coral' },
];

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

const NEUTRAL_ZINC = {
  '50': '#fafafa', '100': '#f4f4f5', '200': '#e4e4e7', '300': '#d4d4d8',
  '400': '#a1a1aa', '500': '#71717a', '600': '#52525b', '700': '#3f3f46',
  '800': '#27272a', '900': '#18181b', '950': '#09090b',
};

let colorsPrimitiveEntries = '';
for (const scale of BRAND_SCALES) {
  for (const shade of SHADES) {
    const cssVar = `--${scale.prefix}-${shade}`;
    colorsPrimitiveEntries += `  { name: '${scale.prefix}-${shade}', cssVar: '${cssVar}', scale: '${scale.label}' },\n`;
  }
}
// Add neutral
for (const [shade] of Object.entries(NEUTRAL_ZINC)) {
  colorsPrimitiveEntries += `  { name: 'neutral-${shade}', cssVar: '--neutral-${shade}', scale: 'Neutral' },\n`;
}
colorsPrimitiveEntries += `  { name: 'white', cssVar: '--white', scale: 'Neutral' },\n`;
colorsPrimitiveEntries += `  { name: 'black', cssVar: '--black', scale: 'Neutral' },\n`;

const colorSchemeEntries = `
  { name: 'primary-50',  cssVar: '--primary-50',  description: 'Orbit Blue 50' },
  { name: 'primary-100', cssVar: '--primary-100', description: 'Orbit Blue 100' },
  { name: 'primary-200', cssVar: '--primary-200', description: 'Orbit Blue 200' },
  { name: 'primary-300', cssVar: '--primary-300', description: 'Orbit Blue 300' },
  { name: 'primary-400', cssVar: '--primary-400', description: 'Orbit Blue 400' },
  { name: 'primary-500', cssVar: '--primary-500', description: 'Orbit Blue 500' },
  { name: 'primary-600', cssVar: '--primary-600', description: 'Orbit Blue 600' },
  { name: 'primary-700', cssVar: '--primary-700', description: 'Orbit Blue 700' },
  { name: 'primary-800', cssVar: '--primary-800', description: 'Orbit Blue 800' },
  { name: 'primary-900', cssVar: '--primary-900', description: 'Orbit Blue 900' },
  { name: 'secondary-50',  cssVar: '--secondary-50',  description: 'Neutral 50' },
  { name: 'secondary-100', cssVar: '--secondary-100', description: 'Neutral 100' },
  { name: 'secondary-200', cssVar: '--secondary-200', description: 'Neutral 200' },
  { name: 'secondary-300', cssVar: '--secondary-300', description: 'Neutral 300' },
  { name: 'secondary-400', cssVar: '--secondary-400', description: 'Neutral 400' },
  { name: 'secondary-500', cssVar: '--secondary-500', description: 'Neutral 500' },
  { name: 'secondary-600', cssVar: '--secondary-600', description: 'Neutral 600' },
  { name: 'secondary-700', cssVar: '--secondary-700', description: 'Neutral 700' },
  { name: 'secondary-800', cssVar: '--secondary-800', description: 'Neutral 800' },
  { name: 'secondary-900', cssVar: '--secondary-900', description: 'Neutral 900' },
`;

// Build grouped semantic color entries from Project-Colours
const pcCol = ALL_COLS[COL.PROJECT_COLOURS];
const seenNames = new Set();

/** Determine group label from a Figma Project-Colours token name */
function getSemanticGroup(figmaName) {
  if (figmaName.startsWith('text/'))                          return 'Text';
  if (figmaName.startsWith('overlay/'))                      return 'Overlay';
  if (figmaName.startsWith('border/input/'))                 return 'Border / Input';
  if (figmaName.startsWith('border/'))                       return 'Border';
  if (figmaName.startsWith('bg/status/'))                    return 'Background / Status';
  if (figmaName.startsWith('bg/surface-brand/'))             return 'Background / Brand Surface';
  if (figmaName.startsWith('bg/surface/'))                   return 'Background / Surface';
  if (figmaName.startsWith('bg/interactive/primary/'))       return 'Background / Interactive Primary';
  if (figmaName.startsWith('bg/interactive/secondary/'))     return 'Background / Interactive Secondary';
  if (figmaName.startsWith('bg/interactive/success/'))       return 'Background / Interactive Success';
  if (figmaName.startsWith('bg/interactive/error/'))         return 'Background / Interactive Error';
  if (figmaName.startsWith('bg/interactive/warning/'))       return 'Background / Interactive Warning';
  if (figmaName.startsWith('bg/input/'))                     return 'Background / Input';
  return 'Other';
}

// Build grouped structure
const semanticGroupsMap = new Map();
for (const vid of pcCol.variableIds) {
  const v = ALL_VARS[vid];
  const cssVar = projectNameToCSSVar(v.name);
  if (seenNames.has(cssVar)) continue;
  seenNames.add(cssVar);
  const displayName = v.name.replace(/\//g, ' / ');
  const group = getSemanticGroup(v.name);
  if (!semanticGroupsMap.has(group)) semanticGroupsMap.set(group, []);
  semanticGroupsMap.get(group).push(
    `    { name: '${cssVar.slice(2)}', cssVar: '${cssVar}', description: '${displayName}' },`
  );
}

let semanticGroupEntries = '';
for (const [group, tokens] of semanticGroupsMap) {
  semanticGroupEntries += `  {\n    group: '${group}',\n    tokens: [\n${tokens.join('\n')}\n    ],\n  },\n`;
}

const colorsTsContent = `// Generated by scripts/generate-tokens.mjs — do not edit by hand

export type ColorToken = {
  name: string;
  cssVar: string;
  scale?: string;
  description?: string;
};

export type ColorPrimitiveToken = ColorToken & { scale: string };

export const colorPrimitives: ColorPrimitiveToken[] = [
${colorsPrimitiveEntries}];

export type SemanticColorGroup = {
  group: string;
  tokens: ColorToken[];
};

export const colourScheme: ColorToken[] = [
${colorSchemeEntries}];

export const colorSemantic: SemanticColorGroup[] = [
${semanticGroupEntries}];
`;

// ─── Build tokens/spacing.ts ──────────────────────────────────────────────────

const spacingTokens = [
  { name: 'spacing-0',   cssVar: '--spacing-0',   remValue: '0',       pxValue: '0px' },
  { name: 'spacing-6xs', cssVar: '--spacing-6xs', remValue: '0.125rem', pxValue: '2px' },
  { name: 'spacing-5xs', cssVar: '--spacing-5xs', remValue: '0.25rem',  pxValue: '4px' },
  { name: 'spacing-4xs', cssVar: '--spacing-4xs', remValue: '0.5rem',   pxValue: '8px' },
  { name: 'spacing-3xs', cssVar: '--spacing-3xs', remValue: '0.75rem',  pxValue: '12px' },
  { name: 'spacing-2xs', cssVar: '--spacing-2xs', remValue: '1rem',     pxValue: '16px' },
  { name: 'spacing-xs',  cssVar: '--spacing-xs',  remValue: '1.25rem',  pxValue: '20px' },
  { name: 'spacing-sm',  cssVar: '--spacing-sm',  remValue: '1.5rem',   pxValue: '24px' },
  { name: 'spacing-md',  cssVar: '--spacing-md',  remValue: '2rem',     pxValue: '32px' },
  { name: 'spacing-lg',  cssVar: '--spacing-lg',  remValue: '2.5rem',   pxValue: '40px' },
  { name: 'spacing-xl',  cssVar: '--spacing-xl',  remValue: '3rem',     pxValue: '48px' },
  { name: 'spacing-2xl', cssVar: '--spacing-2xl', remValue: '4rem',     pxValue: '64px' },
  { name: 'spacing-3xl', cssVar: '--spacing-3xl', remValue: '5rem',     pxValue: '80px' },
  { name: 'spacing-4xl', cssVar: '--spacing-4xl', remValue: '6rem',     pxValue: '96px' },
  { name: 'spacing-5xl', cssVar: '--spacing-5xl', remValue: '8rem',     pxValue: '128px' },
];

const spacingTsContent = `// Generated by scripts/generate-tokens.mjs — do not edit by hand

export type SpacingToken = {
  name: string;
  cssVar: string;
  remValue: string;
  pxValue: string;
};

export const spacingTokens: SpacingToken[] = [
${spacingTokens.map(t => `  { name: '${t.name}', cssVar: '${t.cssVar}', remValue: '${t.remValue}', pxValue: '${t.pxValue}' },`).join('\n')}
];
`;

// ─── Build tokens/radius.ts ───────────────────────────────────────────────────

const radiusTokens = [
  { name: 'none', cssVar: '--radius-none', value: '0' },
  { name: 'xs',   cssVar: '--radius-xs',   value: '2px' },
  { name: 'sm',   cssVar: '--radius-sm',   value: '4px' },
  { name: 'md',   cssVar: '--radius-md',   value: '6px' },
  { name: 'lg',   cssVar: '--radius-lg',   value: '8px' },
  { name: 'xl',   cssVar: '--radius-xl',   value: '12px' },
  { name: '2xl',  cssVar: '--radius-2xl',  value: '16px' },
  { name: '3xl',  cssVar: '--radius-3xl',  value: '24px' },
  { name: 'full', cssVar: '--radius-full', value: '9999px' },
];

const radiusTsContent = `// Generated by scripts/generate-tokens.mjs — do not edit by hand

export type RadiusToken = {
  name: string;
  cssVar: string;
  value: string;
};

export const radiusTokens: RadiusToken[] = [
${radiusTokens.map(t => `  { name: '${t.name}', cssVar: '${t.cssVar}', value: '${t.value}' },`).join('\n')}
];
`;

// ─── Build tokens/typography.ts ───────────────────────────────────────────────

const typCol = ALL_COLS[COL.TYPOGRAPHY];
const typModeId = typCol.defaultModeId;

// Font sizes sorted
const fsSorted = typCol.variableIds
  .filter(id => ALL_VARS[id].name.startsWith('font-size/'))
  .sort((a, b) => ALL_VARS[a].name.localeCompare(ALL_VARS[b].name, undefined, { numeric: true }));

let fontSizeEntries = '';
for (const vid of fsSorted) {
  const v = ALL_VARS[vid];
  const px = v.valuesByMode[typModeId];
  const rem = px / 16;
  const suffix = v.name.replace('font-size/', '');
  fontSizeEntries += `  { name: '${suffix}', cssVar: '--font-size-${suffix}', value: '${rem}rem / ${px}px' },\n`;
}

// Line heights sorted
const lhSorted = typCol.variableIds
  .filter(id => ALL_VARS[id].name.startsWith('line-height/'))
  .sort((a, b) => ALL_VARS[a].name.localeCompare(ALL_VARS[b].name, undefined, { numeric: true }));

let lineHeightEntries = '';
for (const vid of lhSorted) {
  const v = ALL_VARS[vid];
  const px = v.valuesByMode[typModeId];
  const suffix = v.name.replace('line-height/', '');
  const val = px === 100 ? '1 (auto)' : `${px / 16}rem / ${px}px`;
  lineHeightEntries += `  { name: '${suffix}', cssVar: '--line-height-${suffix}', value: '${val}' },\n`;
}

const typographyTsContent = `// Generated by scripts/generate-tokens.mjs — do not edit by hand

export type TypographyToken = {
  name: string;
  cssVar: string;
  value: string;
};

export const fontFamilies: TypographyToken[] = [
  { name: 'primary',   cssVar: '--font-family-primary',   value: "Zilla Slab, Georgia, serif" },
  { name: 'secondary', cssVar: '--font-family-secondary', value: "Outfit, system-ui, sans-serif" },
];

export const fontSizes: TypographyToken[] = [
${fontSizeEntries}];

export const lineHeights: TypographyToken[] = [
${lineHeightEntries}];

export const fontWeights: TypographyToken[] = [
  { name: 'thin',     cssVar: '--font-weight-thin',     value: '100' },
  { name: 'regular',  cssVar: '--font-weight-regular',  value: '400' },
  { name: 'semibold', cssVar: '--font-weight-semibold', value: '600' },
  { name: 'bold',     cssVar: '--font-weight-bold',     value: '700' },
];

export type TypeSpecimen = {
  name: string;
  label: string;
  className: string;
  sample: string;
};

export const typeSpecimens: TypeSpecimen[] = [
  {
    name: 'display',
    label: 'Display',
    className: 'font-serif text-[var(--font-size-3xl)] font-[var(--font-weight-bold)] leading-[var(--line-height-3xl)]',
    sample: 'The quick brown fox',
  },
  {
    name: 'heading-xl',
    label: 'Heading XL',
    className: 'font-serif text-[var(--font-size-2xl)] font-[var(--font-weight-bold)] leading-[var(--line-height-2xl)]',
    sample: 'Design systems scale quality',
  },
  {
    name: 'heading-lg',
    label: 'Heading LG',
    className: 'font-serif text-[var(--font-size-xl)] font-[var(--font-weight-semibold)] leading-[var(--line-height-xl)]',
    sample: 'Tokens, Components, Patterns',
  },
  {
    name: 'heading-md',
    label: 'Heading MD',
    className: 'font-serif text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] leading-[var(--line-height-lg)]',
    sample: 'Consistent, scalable UI',
  },
  {
    name: 'body-base',
    label: 'Body Base',
    className: 'font-sans text-[var(--font-size-base)] font-[var(--font-weight-regular)] leading-[var(--line-height-base)]',
    sample: 'The primary reading size. Used for paragraphs, descriptions, and most UI content.',
  },
  {
    name: 'body-sm',
    label: 'Body SM',
    className: 'font-sans text-[var(--font-size-sm)] font-[var(--font-weight-regular)] leading-[var(--line-height-sm)]',
    sample: 'Secondary body text. Form labels, supporting descriptions, sidebar content.',
  },
  {
    name: 'label',
    label: 'Label',
    className: 'font-sans text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] leading-[var(--line-height-sm)]',
    sample: 'Form label · UI label · Tag',
  },
  {
    name: 'caption',
    label: 'Caption',
    className: 'font-sans text-[var(--font-size-xs)] font-[var(--font-weight-regular)] leading-[var(--line-height-xs)] text-[var(--text-tertiary)]',
    sample: 'Timestamp · Metadata · Fine print',
  },
];
`;

// ─── Write files ──────────────────────────────────────────────────────────────

function write(filePath, content) {
  const abs = resolve(ROOT, filePath);
  writeFileSync(abs, content, 'utf-8');
  console.log(`  ✓ ${filePath}`);
}

console.log('\nGenerating design system token files...\n');
write('styles/tokens.css', tokensCss);
write('tokens/colors.ts', colorsTsContent);
write('tokens/spacing.ts', spacingTsContent);
write('tokens/radius.ts', radiusTsContent);
write('tokens/typography.ts', typographyTsContent);
console.log('\nDone.\n');
