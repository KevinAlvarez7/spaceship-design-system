/**
 * generate-tokens-pen.mjs
 * Generates design/tokens.pen from all resolved values in styles/tokens.css.
 * Run: node scripts/generate-tokens-pen.mjs
 *
 * The output is a Pencil design file (.pen) with:
 *  - ~235 variables across primitives, semantic, typography, shadow, motion, effects, sizing
 *  - Light / Dark theme axis for all tokens that have a dark-mode override
 *
 * Re-run this script after updating styles/tokens.css to keep tokens.pen in sync.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Single-value variable (no theming). */
const v = (type, value) => ({ type, value });

/** Themed color variable with explicit light + dark values. */
const themed = (light, dark) => ({
  type: 'color',
  value: [
    { value: light, theme: { mode: 'light' } },
    { value: dark,  theme: { mode: 'dark'  } },
  ],
});

/** Themed string variable (used for shadow tokens that differ light/dark). */
const themedStr = (light, dark) => ({
  type: 'string',
  value: [
    { value: light, theme: { mode: 'light' } },
    { value: dark,  theme: { mode: 'dark'  } },
  ],
});

// ── Resolved primitive palette ────────────────────────────────────────────────

const P = {
  'orbit-blue': {
    50: '#f3f7ff', 100: '#e1ecff', 200: '#c6daff', 300: '#9fc0ff',
    400: '#6e9eff', 500: '#3c7dff', 600: '#2f6ae6', 700: '#2456bf',
    800: '#1c4599', 900: '#142f66',
  },
  'cosmic-lilac': {
    50: '#f8f5ff', 100: '#ede5ff', 200: '#dacbff', 300: '#c3a8ff',
    400: '#ac89ff', 500: '#9b6bff', 600: '#8558e6', 700: '#6a44bf',
    800: '#523599', 900: '#372166',
  },
  'lumen-yellow': {
    50: '#fffbea', 100: '#fff4c2', 200: '#ffe98a', 300: '#ffe156',
    400: '#ffd530', 500: '#f9c600', 600: '#d3a600', 700: '#a87e00',
    800: '#7a5900', 900: '#4a3400',
  },
  'nova-mint': {
    50: '#ecfdf6', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
    400: '#34d399', 500: '#05a57c', 600: '#048a68', 700: '#047054',
    800: '#035640', 900: '#023c2d',
  },
  'solar-coral': {
    50: '#fff4f1', 100: '#ffe1da', 200: '#ffc2b6', 300: '#ff9e8c',
    400: '#ff7b6a', 500: '#f9614d', 600: '#e34b38', 700: '#c63c2d',
    800: '#992c22', 900: '#661d16',
  },
  neutral: {
    50:  '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8',
    400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46',
    800: '#27272a', 900: '#18181b', 950: '#09090b',
  },
};

const WHITE = '#ffffff';
const BLACK = '#000000';
const blue  = P['orbit-blue'];
const zinc  = P.neutral;

// ── Build variables object ────────────────────────────────────────────────────

const variables = {};

// ── 1. Primitive colors ───────────────────────────────────────────────────────

for (const [scale, steps] of Object.entries(P)) {
  for (const [step, hex] of Object.entries(steps)) {
    variables[`primitive.${scale}.${step}`] = v('color', hex);
  }
}
variables['primitive.neutral.white'] = v('color', WHITE);
variables['primitive.neutral.black'] = v('color', BLACK);

// ── 2. Semantic — Text ────────────────────────────────────────────────────────

variables['semantic.text.primary']               = themed(zinc[900],   zinc[50]);
variables['semantic.text.secondary']             = themed(zinc[600],   zinc[400]);
variables['semantic.text.tertiary']              = themed(zinc[500],   zinc[500]);
variables['semantic.text.placeholder']           = themed('#a3a3a3',   zinc[600]);
variables['semantic.text.inverse']               = themed(WHITE,       BLACK);
variables['semantic.text.interactive-primary']   = themed(blue[600],   blue[300]);
variables['semantic.text.interactive-secondary'] = themed(BLACK,       WHITE);
variables['semantic.text.interactive-disabled']  = themed('#d4d4d4',   zinc[600]);
variables['semantic.text.status-success']        = v('color', P['nova-mint'][700]);
variables['semantic.text.status-warning']        = v('color', P['lumen-yellow'][700]);
variables['semantic.text.status-error']          = v('color', P['solar-coral'][700]);
variables['semantic.text.status-info']           = v('color', P['orbit-blue'][700]);

// ── 3. Semantic — Overlays ────────────────────────────────────────────────────
// rgba converted to 8-digit hex (#RRGGBBAA)

variables['semantic.overlay.light']  = v('color', '#0000001a'); // rgba(0,0,0, 0.10)
variables['semantic.overlay.medium'] = v('color', '#0000004d'); // rgba(0,0,0, 0.30)
variables['semantic.overlay.heavy']  = v('color', '#00000080'); // rgba(0,0,0, 0.50)

// ── 4. Semantic — Borders ─────────────────────────────────────────────────────

variables['semantic.border.default'] = themed(BLACK,        zinc[700]);
variables['semantic.border.subtle']  = themed('#262626',    zinc[600]);
variables['semantic.border.success'] = v('color', P['nova-mint'][700]);
variables['semantic.border.error']   = v('color', P['solar-coral'][600]);
variables['semantic.border.warning'] = v('color', P['lumen-yellow'][600]);
variables['semantic.border.info']    = v('color', P['orbit-blue'][600]);

// ── 5. Semantic — Border Input ────────────────────────────────────────────────

variables['semantic.border-input.default'] = themed(BLACK, zinc[600]);
variables['semantic.border-input.focus']   = v('color', P['orbit-blue'][600]);

// ── 6. Semantic — Bg Status ───────────────────────────────────────────────────

variables['semantic.bg-status.success'] = v('color', P['nova-mint'][200]);
variables['semantic.bg-status.warning'] = v('color', P['lumen-yellow'][200]);
variables['semantic.bg-status.error']   = v('color', P['solar-coral'][200]);
variables['semantic.bg-status.info']    = v('color', P['orbit-blue'][200]);
variables['semantic.bg-status.neutral'] = v('color', '#e5e5e5');

// ── 7. Semantic — Bg Surface ──────────────────────────────────────────────────

variables['semantic.bg-surface.primary']   = themed(zinc[50],   zinc[900]);
variables['semantic.bg-surface.secondary'] = themed(zinc[100],  zinc[800]);
variables['semantic.bg-surface.tertiary']  = themed(zinc[200],  zinc[700]);
variables['semantic.bg-surface.base']      = themed(WHITE,      zinc[950]);
variables['semantic.bg-surface.paper']     = themed(WHITE,      zinc[900]);
variables['semantic.bg-surface.fade']      = themed('#fcfcfc',  zinc[900]);

// ── 8. Semantic — Bg Input ────────────────────────────────────────────────────

variables['semantic.bg-input.default'] = v('color', zinc[50]);

// ── 9. Semantic — Bg Interactive ─────────────────────────────────────────────

const interactive = {
  primary:   [blue[500],              blue[600],              blue[700],              '#e5e5e5'],
  secondary: [zinc[100],              zinc[200],              zinc[300],              '#fafafa'],
  success:   [P['nova-mint'][500],    P['nova-mint'][600],    P['nova-mint'][700],    '#e5e5e5'],
  error:     [P['solar-coral'][500],  P['solar-coral'][600],  P['solar-coral'][700],  '#e5e5e5'],
  warning:   [P['lumen-yellow'][300], P['lumen-yellow'][400], P['lumen-yellow'][500], '#e5e5e5'],
};

for (const [name, [def, hov, pre, dis]] of Object.entries(interactive)) {
  variables[`semantic.bg-interactive-${name}.default`]  = v('color', def);
  variables[`semantic.bg-interactive-${name}.hover`]    = v('color', hov);
  variables[`semantic.bg-interactive-${name}.pressed`]  = v('color', pre);
  variables[`semantic.bg-interactive-${name}.disabled`] = v('color', dis);
}

// ── 10. Semantic — Bg Surface Brand / Status ──────────────────────────────────

const surfacePalettes = {
  brand:   blue,
  success: P['nova-mint'],
  error:   P['solar-coral'],
  warning: P['lumen-yellow'],
};

for (const [name, scale] of Object.entries(surfacePalettes)) {
  variables[`semantic.bg-surface-${name}.primary`]   = v('color', scale[50]);
  variables[`semantic.bg-surface-${name}.secondary`] = v('color', scale[100]);
  variables[`semantic.bg-surface-${name}.tertiary`]  = v('color', scale[200]);
  variables[`semantic.bg-surface-${name}.base`]      = v('color', scale[300]);
}

// ── 11. Typography ────────────────────────────────────────────────────────────

const fontSizes = {
  '2xs': 11, xs: 12, sm: 14, base: 16, lg: 18, xl: 20,
  '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60,
  '7xl': 72, '8xl': 96, '9xl': 128,
};
for (const [name, px] of Object.entries(fontSizes)) {
  variables[`type.size.${name}`] = v('number', px);
}

const lineHeights = {
  '2xs': 14, xs: 16, sm: 20, base: 24, lg: 28, xl: 28,
  '2xl': 32, '3xl': 36, '4xl': 40, '5xl': 72, '6xl': 100,
  '7xl': 1, '8xl': 1, '9xl': 1, // 1 = auto / 100%
};
for (const [name, px] of Object.entries(lineHeights)) {
  variables[`type.line-height.${name}`] = v('number', px);
}

const fontWeights = { thin: 100, regular: 400, medium: 500, semibold: 600, bold: 700 };
for (const [name, weight] of Object.entries(fontWeights)) {
  variables[`type.weight.${name}`] = v('number', weight);
}

variables['type.family.primary']   = v('string', 'Zilla Slab');
variables['type.family.secondary'] = v('string', 'Outfit');
variables['type.family.mono']      = v('string', 'JetBrains Mono');

// ── 12. Shadows ───────────────────────────────────────────────────────────────

variables['shadow.border'] = themedStr(
  '0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.06), 0px 2px 4px 0px rgba(0,0,0,0.04)',
  '0px 0px 0px 1px rgba(255,255,255,0.08), 0px 1px 2px -1px rgba(0,0,0,0.4), 0px 2px 4px 0px rgba(0,0,0,0.3)',
);
variables['shadow.border-hover'] = themedStr(
  '0px 0px 0px 1px rgba(0,0,0,0.08), 0px 1px 2px -1px rgba(0,0,0,0.08), 0px 2px 4px 0px rgba(0,0,0,0.06)',
  '0px 0px 0px 1px rgba(255,255,255,0.10), 0px 1px 2px -1px rgba(0,0,0,0.5), 0px 2px 4px 0px rgba(0,0,0,0.4)',
);
variables['shadow.keycap'] = themedStr(
  '0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.06), 0px 3px 0px 0px rgba(0,0,0,0.10)',
  '0px 0px 0px 1px rgba(255,255,255,0.10), 0px 1px 2px -1px rgba(0,0,0,0.4), 0px 3px 0px 0px rgba(255,255,255,0.06)',
);
variables['shadow.keycap-hover'] = themedStr(
  '0px 0px 0px 1px rgba(0,0,0,0.08), 0px 1px 2px -1px rgba(0,0,0,0.08), 0px 3px 0px 0px rgba(0,0,0,0.14)',
  '0px 0px 0px 1px rgba(255,255,255,0.14), 0px 1px 2px -1px rgba(0,0,0,0.5), 0px 3px 0px 0px rgba(255,255,255,0.10)',
);
variables['shadow.keycap-pressed'] = themedStr(
  '0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.06), 0px 0px 0px 0px rgba(0,0,0,0.00)',
  '0px 0px 0px 1px rgba(255,255,255,0.10), 0px 1px 2px -1px rgba(0,0,0,0.4), 0px 0px 0px 0px rgba(255,255,255,0.00)',
);

// ── 13. Motion ────────────────────────────────────────────────────────────────

variables['motion.duration.instant'] = v('number', 50);
variables['motion.duration.fast']    = v('number', 100);
variables['motion.duration.base']    = v('number', 200);
variables['motion.duration.slow']    = v('number', 300);
variables['motion.duration.slower']  = v('number', 500);

variables['motion.easing.linear']      = v('string', 'linear');
variables['motion.easing.ease-in']     = v('string', 'cubic-bezier(0.4, 0, 1, 1)');
variables['motion.easing.ease-out']    = v('string', 'cubic-bezier(0, 0, 0.2, 1)');
variables['motion.easing.ease-in-out'] = v('string', 'cubic-bezier(0.4, 0, 0.2, 1)');
variables['motion.easing.spring']      = v('string', 'cubic-bezier(0.34, 1.56, 0.64, 1)');

// JS spring presets (for reference — used by motion/react components, not CSS)
variables['motion.spring.interactive.stiffness'] = v('number', 400);
variables['motion.spring.interactive.damping']   = v('number', 30);
variables['motion.spring.gentle.stiffness']      = v('number', 160);
variables['motion.spring.gentle.damping']        = v('number', 24);
variables['motion.spring.layout.stiffness']      = v('number', 200);
variables['motion.spring.layout.damping']        = v('number', 24);

// ── 14. Effects ───────────────────────────────────────────────────────────────
// color-mix() values are approximated to 8-digit hex (#RRGGBBAA)
// neutral-400 = #a1a1aa, neutral-500 = #71717a

variables['effect.gravity-bg']   = themed('#fafaf8', zinc[950]);
variables['effect.gravity-dot']  = v('color', '#a1a1aa52'); // neutral-400 at 32% opacity
variables['effect.gravity-grid'] = v('color', '#a1a1aa21'); // neutral-400 at 13% opacity

variables['effect.thinking-dot']  = themed('#a1a1aa80', '#71717a80'); // 50% opacity
variables['effect.thinking-line'] = themed('#a1a1aa7a', '#71717a7a'); // 48% opacity

variables['effect.thinking.1'] = themed(P['solar-coral'][500],  P['solar-coral'][400]);
variables['effect.thinking.2'] = themed(P['lumen-yellow'][500], P['lumen-yellow'][400]);
variables['effect.thinking.3'] = themed(P['nova-mint'][500],    P['nova-mint'][400]);
variables['effect.thinking.4'] = themed(P['orbit-blue'][500],   P['orbit-blue'][400]);
variables['effect.thinking.5'] = themed(P['cosmic-lilac'][500], P['cosmic-lilac'][400]);

variables['effect.thinking-ship.belly']    = themed(P['solar-coral'][500],  P['solar-coral'][400]);
variables['effect.thinking-ship.body']     = themed(P['orbit-blue'][500],   P['orbit-blue'][400]);
variables['effect.thinking-ship.dome']     = themed(P['lumen-yellow'][500], P['lumen-yellow'][400]);
variables['effect.thinking-ship.asteroid'] = themed(zinc[400],              zinc[500]);
variables['effect.shimmer-highlight']      = v('color', WHITE);

// ── 15. Sizing ────────────────────────────────────────────────────────────────

variables['sizing.chat-min']     = v('number', 320);
variables['sizing.chat-default'] = v('number', 428);
variables['sizing.chat-panel']   = v('number', 560);
variables['sizing.chat-max']     = v('number', 768);

// ── Canvas Layout — Visual Token Reference ───────────────────────────────────

let idCounter = 0;
const uid = () => `tok${++idCounter}`;

const SWATCH_W = 64;
const SWATCH_H = 64;
const LABEL_FONT = 'Outfit';
const LABEL_SIZE = 10;
const LABEL_COLOR = '$semantic.text.secondary';
const HEADING_COLOR = '$semantic.text.primary';
const SECTION_GAP = 56;
const ROW_GAP = 12;
const COL_GAP = 4;

function makeText(content, opts = {}) {
  return {
    type: 'text',
    id: uid(),
    content,
    fontFamily: opts.fontFamily || LABEL_FONT,
    fontSize: opts.fontSize || LABEL_SIZE,
    fontWeight: opts.fontWeight || '400',
    fill: opts.fill || LABEL_COLOR,
    ...(opts.textGrowth ? { textGrowth: opts.textGrowth, width: opts.width } : {}),
  };
}

function makeSwatch(varName, label, size = SWATCH_W) {
  return {
    type: 'frame',
    id: uid(),
    layout: 'vertical',
    gap: 2,
    width: 'fit_content',
    height: 'fit_content',
    children: [
      {
        type: 'rectangle',
        id: uid(),
        width: size,
        height: size,
        cornerRadius: 6,
        fill: `$${varName}`,
        stroke: { align: 'inside', thickness: 1, fill: '#00000012' },
      },
      makeText(label),
    ],
  };
}

function makeScaleRow(scaleName, varPrefix, steps) {
  return {
    type: 'frame',
    id: uid(),
    layout: 'vertical',
    gap: 8,
    width: 'fit_content',
    height: 'fit_content',
    children: [
      makeText(scaleName, { fontSize: 14, fontWeight: '600', fill: HEADING_COLOR }),
      {
        type: 'frame',
        id: uid(),
        layout: 'horizontal',
        gap: COL_GAP,
        width: 'fit_content',
        height: 'fit_content',
        children: steps.map(step =>
          makeSwatch(`${varPrefix}.${step}`, String(step))
        ),
      },
    ],
  };
}

function makeSectionHeading(title) {
  return makeText(title, { fontSize: 20, fontWeight: '700', fill: HEADING_COLOR });
}

function makeSemanticGroup(groupName, tokens) {
  return {
    type: 'frame',
    id: uid(),
    layout: 'vertical',
    gap: 8,
    width: 'fit_content',
    height: 'fit_content',
    children: [
      makeText(groupName, { fontSize: 13, fontWeight: '600', fill: HEADING_COLOR }),
      {
        type: 'frame',
        id: uid(),
        layout: 'horizontal',
        gap: COL_GAP,
        width: 'fit_content',
        height: 'fit_content',
        children: tokens.map(({ varName, label }) =>
          makeSwatch(varName, label, 52)
        ),
      },
    ],
  };
}

// ── Build canvas children ────────────────────────────────────────────────────

const children = [];

// — Section 1: Primitives —
const primitivesSection = {
  type: 'frame',
  id: uid(),
  name: 'Primitive Colors',
  layout: 'vertical',
  gap: ROW_GAP,
  width: 'fit_content',
  height: 'fit_content',
  x: 0,
  y: 0,
  fill: '$semantic.bg-surface.base',
  padding: 32,
  cornerRadius: 16,
  children: [
    makeSectionHeading('Primitive Color Scales'),
    makeScaleRow('Orbit Blue',    'primitive.orbit-blue',   [50,100,200,300,400,500,600,700,800,900]),
    makeScaleRow('Cosmic Lilac',  'primitive.cosmic-lilac', [50,100,200,300,400,500,600,700,800,900]),
    makeScaleRow('Lumen Yellow',  'primitive.lumen-yellow', [50,100,200,300,400,500,600,700,800,900]),
    makeScaleRow('Nova Mint',     'primitive.nova-mint',    [50,100,200,300,400,500,600,700,800,900]),
    makeScaleRow('Solar Coral',   'primitive.solar-coral',  [50,100,200,300,400,500,600,700,800,900]),
    makeScaleRow('Neutral',       'primitive.neutral',      [50,100,200,300,400,500,600,700,800,900,950]),
    {
      type: 'frame',
      id: uid(),
      layout: 'horizontal',
      gap: COL_GAP,
      width: 'fit_content',
      height: 'fit_content',
      children: [
        makeSwatch('primitive.neutral.white', 'white'),
        makeSwatch('primitive.neutral.black', 'black'),
      ],
    },
  ],
};
children.push(primitivesSection);

// — Section 2: Semantic Text —
const semanticTextSection = {
  type: 'frame',
  id: uid(),
  name: 'Semantic Text',
  layout: 'vertical',
  gap: ROW_GAP,
  width: 'fit_content',
  height: 'fit_content',
  x: 0,
  y: 920,
  fill: '$semantic.bg-surface.base',
  padding: 32,
  cornerRadius: 16,
  children: [
    makeSectionHeading('Semantic — Text'),
    makeSemanticGroup('Text', [
      { varName: 'semantic.text.primary', label: 'primary' },
      { varName: 'semantic.text.secondary', label: 'secondary' },
      { varName: 'semantic.text.tertiary', label: 'tertiary' },
      { varName: 'semantic.text.placeholder', label: 'placeholder' },
      { varName: 'semantic.text.inverse', label: 'inverse' },
    ]),
    makeSemanticGroup('Interactive Text', [
      { varName: 'semantic.text.interactive-primary', label: 'primary' },
      { varName: 'semantic.text.interactive-secondary', label: 'secondary' },
      { varName: 'semantic.text.interactive-disabled', label: 'disabled' },
    ]),
    makeSemanticGroup('Status Text', [
      { varName: 'semantic.text.status-success', label: 'success' },
      { varName: 'semantic.text.status-warning', label: 'warning' },
      { varName: 'semantic.text.status-error', label: 'error' },
      { varName: 'semantic.text.status-info', label: 'info' },
    ]),
  ],
};
children.push(semanticTextSection);

// — Section 3: Semantic Borders —
const semanticBorderSection = {
  type: 'frame',
  id: uid(),
  name: 'Semantic Borders',
  layout: 'vertical',
  gap: ROW_GAP,
  width: 'fit_content',
  height: 'fit_content',
  x: 0,
  y: 1340,
  fill: '$semantic.bg-surface.base',
  padding: 32,
  cornerRadius: 16,
  children: [
    makeSectionHeading('Semantic — Borders'),
    makeSemanticGroup('Border', [
      { varName: 'semantic.border.default', label: 'default' },
      { varName: 'semantic.border.subtle', label: 'subtle' },
      { varName: 'semantic.border.success', label: 'success' },
      { varName: 'semantic.border.error', label: 'error' },
      { varName: 'semantic.border.warning', label: 'warning' },
      { varName: 'semantic.border.info', label: 'info' },
    ]),
    makeSemanticGroup('Border Input', [
      { varName: 'semantic.border-input.default', label: 'default' },
      { varName: 'semantic.border-input.focus', label: 'focus' },
    ]),
    makeSemanticGroup('Overlay', [
      { varName: 'semantic.overlay.light', label: 'light' },
      { varName: 'semantic.overlay.medium', label: 'medium' },
      { varName: 'semantic.overlay.heavy', label: 'heavy' },
    ]),
  ],
};
children.push(semanticBorderSection);

// — Section 4: Semantic Backgrounds —
const semanticBgSection = {
  type: 'frame',
  id: uid(),
  name: 'Semantic Backgrounds',
  layout: 'vertical',
  gap: ROW_GAP,
  width: 'fit_content',
  height: 'fit_content',
  x: 0,
  y: 1780,
  fill: '$semantic.bg-surface.base',
  padding: 32,
  cornerRadius: 16,
  children: [
    makeSectionHeading('Semantic — Backgrounds'),
    makeSemanticGroup('Surface', [
      { varName: 'semantic.bg-surface.base', label: 'base' },
      { varName: 'semantic.bg-surface.paper', label: 'paper' },
      { varName: 'semantic.bg-surface.fade', label: 'fade' },
      { varName: 'semantic.bg-surface.primary', label: 'primary' },
      { varName: 'semantic.bg-surface.secondary', label: 'secondary' },
      { varName: 'semantic.bg-surface.tertiary', label: 'tertiary' },
    ]),
    makeSemanticGroup('Status', [
      { varName: 'semantic.bg-status.success', label: 'success' },
      { varName: 'semantic.bg-status.warning', label: 'warning' },
      { varName: 'semantic.bg-status.error', label: 'error' },
      { varName: 'semantic.bg-status.info', label: 'info' },
      { varName: 'semantic.bg-status.neutral', label: 'neutral' },
    ]),
    makeSemanticGroup('Input', [
      { varName: 'semantic.bg-input.default', label: 'default' },
    ]),
  ],
};
children.push(semanticBgSection);

// — Section 5: Interactive Backgrounds —
const interactiveBgSection = {
  type: 'frame',
  id: uid(),
  name: 'Interactive Backgrounds',
  layout: 'vertical',
  gap: ROW_GAP,
  width: 'fit_content',
  height: 'fit_content',
  x: 0,
  y: 2260,
  fill: '$semantic.bg-surface.base',
  padding: 32,
  cornerRadius: 16,
  children: [
    makeSectionHeading('Semantic — Interactive Backgrounds'),
    ...['primary', 'secondary', 'success', 'error', 'warning'].map(name =>
      makeSemanticGroup(`Interactive ${name[0].toUpperCase() + name.slice(1)}`, [
        { varName: `semantic.bg-interactive-${name}.default`, label: 'default' },
        { varName: `semantic.bg-interactive-${name}.hover`, label: 'hover' },
        { varName: `semantic.bg-interactive-${name}.pressed`, label: 'pressed' },
        { varName: `semantic.bg-interactive-${name}.disabled`, label: 'disabled' },
      ])
    ),
  ],
};
children.push(interactiveBgSection);

// — Section 6: Surface Brand/Status —
const surfaceBrandSection = {
  type: 'frame',
  id: uid(),
  name: 'Surface Brand & Status',
  layout: 'vertical',
  gap: ROW_GAP,
  width: 'fit_content',
  height: 'fit_content',
  x: 0,
  y: 2860,
  fill: '$semantic.bg-surface.base',
  padding: 32,
  cornerRadius: 16,
  children: [
    makeSectionHeading('Semantic — Surface Brand & Status'),
    ...['brand', 'success', 'error', 'warning'].map(name =>
      makeSemanticGroup(`Surface ${name[0].toUpperCase() + name.slice(1)}`, [
        { varName: `semantic.bg-surface-${name}.primary`, label: 'primary' },
        { varName: `semantic.bg-surface-${name}.secondary`, label: 'secondary' },
        { varName: `semantic.bg-surface-${name}.tertiary`, label: 'tertiary' },
        { varName: `semantic.bg-surface-${name}.base`, label: 'base' },
      ])
    ),
  ],
};
children.push(surfaceBrandSection);

// — Section 7: Typography —
const typeSizes = ['2xs','xs','sm','base','lg','xl','2xl','3xl','4xl','5xl','6xl','7xl','8xl','9xl'];
const typeWeights = ['thin','regular','medium','semibold','bold'];
const typeFamilies = ['primary','secondary','mono'];

const typographySection = {
  type: 'frame',
  id: uid(),
  name: 'Typography',
  layout: 'vertical',
  gap: 16,
  width: 'fit_content',
  height: 'fit_content',
  x: 820,
  y: 0,
  fill: '$semantic.bg-surface.base',
  padding: 32,
  cornerRadius: 16,
  children: [
    makeSectionHeading('Typography'),
    makeText('Font Families', { fontSize: 14, fontWeight: '600', fill: HEADING_COLOR }),
    ...typeFamilies.map(fam => ({
      type: 'frame',
      id: uid(),
      layout: 'horizontal',
      gap: 12,
      alignItems: 'center',
      width: 'fit_content',
      height: 'fit_content',
      children: [
        makeText(fam, { fontSize: 11, fontWeight: '500', fill: LABEL_COLOR }),
        makeText(`The quick brown fox`, { fontSize: 16, fontFamily: `$type.family.${fam}`, fill: HEADING_COLOR }),
      ],
    })),
    makeText('Font Sizes', { fontSize: 14, fontWeight: '600', fill: HEADING_COLOR }),
    ...typeSizes.filter(s => fontSizes[s] <= 48).map(size => ({
      type: 'frame',
      id: uid(),
      layout: 'horizontal',
      gap: 12,
      alignItems: 'center',
      width: 'fit_content',
      height: 'fit_content',
      children: [
        makeText(`${size} (${fontSizes[size]}px)`, { fontSize: 11, fontWeight: '500', fill: LABEL_COLOR }),
        makeText('Aa', { fontSize: fontSizes[size], fontFamily: 'Outfit', fill: HEADING_COLOR }),
      ],
    })),
    makeText('Font Weights', { fontSize: 14, fontWeight: '600', fill: HEADING_COLOR }),
    ...typeWeights.map(w => ({
      type: 'frame',
      id: uid(),
      layout: 'horizontal',
      gap: 12,
      alignItems: 'center',
      width: 'fit_content',
      height: 'fit_content',
      children: [
        makeText(`${w} (${fontWeights[w]})`, { fontSize: 11, fontWeight: '500', fill: LABEL_COLOR }),
        makeText('Design System', { fontSize: 16, fontFamily: 'Outfit', fontWeight: String(fontWeights[w]), fill: HEADING_COLOR }),
      ],
    })),
  ],
};
children.push(typographySection);

// — Section 8: Effects —
const effectsSection = {
  type: 'frame',
  id: uid(),
  name: 'Effects',
  layout: 'vertical',
  gap: ROW_GAP,
  width: 'fit_content',
  height: 'fit_content',
  x: 820,
  y: 900,
  fill: '$semantic.bg-surface.base',
  padding: 32,
  cornerRadius: 16,
  children: [
    makeSectionHeading('Effects'),
    makeSemanticGroup('Gravity', [
      { varName: 'effect.gravity-bg', label: 'bg' },
      { varName: 'effect.gravity-dot', label: 'dot' },
      { varName: 'effect.gravity-grid', label: 'grid' },
    ]),
    makeSemanticGroup('Thinking', [
      { varName: 'effect.thinking-dot', label: 'dot' },
      { varName: 'effect.thinking-line', label: 'line' },
      { varName: 'effect.thinking.1', label: '1' },
      { varName: 'effect.thinking.2', label: '2' },
      { varName: 'effect.thinking.3', label: '3' },
      { varName: 'effect.thinking.4', label: '4' },
      { varName: 'effect.thinking.5', label: '5' },
    ]),
    makeSemanticGroup('Thinking Ship', [
      { varName: 'effect.thinking-ship.belly', label: 'belly' },
      { varName: 'effect.thinking-ship.body', label: 'body' },
      { varName: 'effect.thinking-ship.dome', label: 'dome' },
      { varName: 'effect.thinking-ship.asteroid', label: 'asteroid' },
    ]),
    makeSemanticGroup('Shimmer', [
      { varName: 'effect.shimmer-highlight', label: 'highlight' },
    ]),
  ],
};
children.push(effectsSection);

// — Section 9: Motion & Sizing reference (text-only) —
const motionSection = {
  type: 'frame',
  id: uid(),
  name: 'Motion & Sizing',
  layout: 'vertical',
  gap: 12,
  width: 480,
  height: 'fit_content',
  x: 820,
  y: 1460,
  fill: '$semantic.bg-surface.base',
  padding: 32,
  cornerRadius: 16,
  children: [
    makeSectionHeading('Motion'),
    makeText('Durations', { fontSize: 14, fontWeight: '600', fill: HEADING_COLOR }),
    ...['instant (50ms)', 'fast (100ms)', 'base (200ms)', 'slow (300ms)', 'slower (500ms)'].map(d =>
      makeText(d, { fontSize: 12, fill: HEADING_COLOR })
    ),
    makeText('Easings', { fontSize: 14, fontWeight: '600', fill: HEADING_COLOR }),
    ...['linear', 'ease-in: cubic-bezier(0.4, 0, 1, 1)', 'ease-out: cubic-bezier(0, 0, 0.2, 1)', 'ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)', 'spring: cubic-bezier(0.34, 1.56, 0.64, 1)'].map(e =>
      makeText(e, { fontSize: 11, fill: HEADING_COLOR })
    ),
    makeText('Spring Presets', { fontSize: 14, fontWeight: '600', fill: HEADING_COLOR }),
    ...['interactive: stiffness 400, damping 30', 'gentle: stiffness 160, damping 24', 'layout: stiffness 200, damping 24'].map(s =>
      makeText(s, { fontSize: 11, fill: HEADING_COLOR })
    ),
    makeSectionHeading('Sizing'),
    ...['chat-min: 320px', 'chat-default: 428px', 'chat-panel: 560px', 'chat-max: 768px'].map(s =>
      makeText(s, { fontSize: 12, fill: HEADING_COLOR })
    ),
  ],
};
children.push(motionSection);

// ── Build .pen document ───────────────────────────────────────────────────────

const pen = {
  version: '2.10',
  themes: [
    { id: 'light', axis: 'mode', name: 'Light', default: true },
    { id: 'dark',  axis: 'mode', name: 'Dark' },
  ],
  imports: [],
  variables,
  children,
};

// ── Write ─────────────────────────────────────────────────────────────────────

const outPath = join(ROOT, 'design', 'tokens.pen');
mkdirSync(join(ROOT, 'design'), { recursive: true });
writeFileSync(outPath, JSON.stringify(pen, null, 2), 'utf-8');

const count = Object.keys(variables).length;
const nodeCount = idCounter;
console.log(`✓  design/tokens.pen  —  ${count} variables, ${nodeCount} canvas nodes written`);
console.log(`   Light/Dark themes ready. Open in Pencil and switch modes to verify.`);
