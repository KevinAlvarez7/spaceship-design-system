'use server';

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

// Serializable mirror of ControlDef — no React imports, safe for Server Actions
export type SerializableControl =
  | { name: string; type: 'select';  options: string[]; defaultValue: string;  label?: string }
  | { name: string; type: 'boolean'; defaultValue: boolean; label?: string }
  | { name: string; type: 'text';    defaultValue: string;  label?: string; placeholder?: string };

export type GraduateParams = {
  playgroundSlug: string;  // 'pg-button'
  versionLabel: string;    // 'v1'
  componentName: string;   // 'Button'
  sourcePath: string;      // 'components/playground/button/v1.tsx'
  importPath: string;      // '@/components/ui'
  controls: SerializableControl[];
};

export type DSViolation = {
  rule: 'hardcoded-hex' | 'tailwind-color' | 'primitive-token' | 'dark-prefix' | 'forbidden-import';
  line: number;
  match: string;
  message: string;
};

export type BuildVerification = {
  buildPassed: boolean;
  buildOutput: string;
  lintPassed: boolean;
  lintOutput: string;
};

export type GraduateResult =
  | { success: true;  slug: string; filesCreated: string[]; filesModified: string[]; warnings: DSViolation[] }
  | { success: false; error: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** 'Button' → 'button', 'ThinkingDots' → 'thinking-dots' */
function toKebabCase(name: string): string {
  return name.replace(/([A-Z])/g, (m, l, offset) => (offset > 0 ? '-' : '') + l.toLowerCase());
}

/** 'Button' → 'button', 'ThinkingDots' → 'thinkingDots' */
function toCamelCase(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/** 'ThinkingDots' → 'Thinking Dots' */
function toTitleCase(name: string): string {
  return name.replace(/([A-Z])/g, (m, l, offset) => (offset > 0 ? ' ' : '') + l);
}

/** Truncate to last N lines */
function lastNLines(output: string, n: number): string {
  const lines = output.split('\n');
  return lines.slice(-n).join('\n');
}

// ─── DS Compliance Checks ─────────────────────────────────────────────────────

function runComplianceChecks(source: string): DSViolation[] {
  const violations: DSViolation[] = [];
  const lines = source.split('\n');

  const rules: Array<{
    rule: DSViolation['rule'];
    pattern: RegExp;
    message: (match: string) => string;
  }> = [
    {
      rule: 'hardcoded-hex',
      pattern: /#[0-9a-fA-F]{3,8}\b/,
      message: (m) => `Hardcoded hex value "${m}" — use a semantic token instead`,
    },
    {
      rule: 'tailwind-color',
      pattern: /\b(?:text|bg|border|ring|fill|stroke|decoration|caret|accent|shadow)-(?:white|black|transparent|inherit|current|zinc|gray|slate|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+|(?:text|bg|border)-(?:white|black|transparent)\b/,
      message: (m) => `Tailwind color utility "${m}" — use a semantic token instead`,
    },
    {
      rule: 'primitive-token',
      pattern: /--(?:orbit|neutral|space|sky|green|red|orange|amber|lime|teal|cyan|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/,
      message: (m) => `Primitive token "${m}" — reference a semantic token instead`,
    },
    {
      rule: 'dark-prefix',
      pattern: /\bdark:/,
      message: (m) => `Tailwind dark: prefix "${m}" — use [data-theme="dark"] selectors via tokens`,
    },
    {
      rule: 'forbidden-import',
      pattern: /from\s+['"](?:@\/)?components\/(?:viewer|shadcn)\//,
      message: (m) => `Forbidden import "${m}" — DS components must not import from viewer or shadcn`,
    },
  ];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const lineText = lines[i];
    for (const { rule, pattern, message } of rules) {
      const match = lineText.match(pattern);
      if (match) {
        violations.push({
          rule,
          line: lineNum,
          match: match[0],
          message: message(match[0]),
        });
      }
    }
  }

  return violations;
}

// ─── Viewer page generator ────────────────────────────────────────────────────

function generateViewerPageContent(
  componentName: string,
  importPath: string,
  controls: SerializableControl[],
  sourceContent: string,
): string {
  const selectControls = controls.filter(
    (c): c is Extract<SerializableControl, { type: 'select' }> => c.type === 'select',
  );
  const booleanControls = controls.filter(
    (c): c is Extract<SerializableControl, { type: 'boolean' }> => c.type === 'boolean',
  );

  const variantControl = selectControls.find(c => c.name === 'variant');
  const sizeControl = selectControls.find(c => c.name === 'size');
  const surfaceControl = selectControls.find(c => c.name === 'surface');
  const disabledControl = booleanControls.find(c => c.name === 'disabled');
  const disableMotionControl = booleanControls.find(c => c.name === 'disableMotion');
  const otherSelectControls = selectControls.filter(
    c => !['variant', 'size', 'surface'].includes(c.name),
  );

  // Detect icon props from source
  const hasLeadingIcon = /leadingIcon/.test(sourceContent);
  const hasTrailingIcon = /trailingIcon/.test(sourceContent);
  const hasIconProp = /\bicon\b/.test(sourceContent);
  const hasIconProps = hasLeadingIcon || hasTrailingIcon || hasIconProp;

  // Build lucide imports if icons detected
  const lucideImport = hasIconProps
    ? `import { Plus, ArrowRight, Search, Check, Trash2, X, Settings } from 'lucide-react';\n`
    : '';

  // Build props rows
  const propsRows: string[] = controls.map(c => {
    let type: string;
    let defaultVal: string;
    if (c.type === 'select') {
      type = c.options.map(o => `"${o}"`).join(' | ');
      defaultVal = `"${c.defaultValue}"`;
    } else if (c.type === 'boolean') {
      type = 'boolean';
      defaultVal = String(c.defaultValue);
    } else {
      type = 'string';
      defaultVal = `"${c.defaultValue}"`;
    }
    const label = c.label ?? c.name;
    return `  { name: '${c.name}', type: '${type}', default: '${defaultVal}', description: '${label}' },`;
  });

  // Add standard additional props
  propsRows.push(`  { name: 'className', type: 'string', default: '—', description: 'Additional classes merged via cn()' },`);
  if (hasLeadingIcon) {
    propsRows.push(`  { name: 'leadingIcon', type: 'ReactNode', default: '—', description: 'Icon rendered before children' },`);
  }
  if (hasTrailingIcon) {
    propsRows.push(`  { name: 'trailingIcon', type: 'ReactNode', default: '—', description: 'Icon rendered after children' },`);
  }
  if (hasIconProp) {
    propsRows.push(`  { name: 'icon', type: 'ReactNode', default: '—', description: 'Icon for icon-only buttons' },`);
  }

  // Helper to get default variant/size for rendering
  const defaultVariant = variantControl?.defaultValue ?? variantControl?.options[0] ?? 'primary';
  const defaultSize = sizeControl?.defaultValue;

  // Helper: build a component JSX string with given extra props
  function renderComp(extraProps: string, children: string, useChildren = true): string {
    const comp = `${componentName}`;
    if (useChildren) return `<${comp}${extraProps}>${children}</${comp}>`;
    return `<${comp}${extraProps} />`;
  }

  const sections: string[] = [];

  // ── Variants section ──────────────────────────────────────────────────────
  if (variantControl) {
    const variantItems = variantControl.options
      .map(opt => `          ${renderComp(` variant="${opt}"`, opt.charAt(0).toUpperCase() + opt.slice(1))}`)
      .join('\n');
    const variantLabel = variantControl.options.map(o => `"${o}"`).join(' / ');
    sections.push(`      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variants</h2>
        <Preview label="${variantLabel}">
${variantItems}
        </Preview>
      </section>`);
  }

  // ── Sizes section ─────────────────────────────────────────────────────────
  if (sizeControl) {
    const sizeItems = sizeControl.options
      .map(opt => `          ${renderComp(` size="${opt}"`, opt.charAt(0).toUpperCase() + opt.slice(1))}`)
      .join('\n');
    const sizeLabel = sizeControl.options.join(' / ');
    sections.push(`      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <Preview label="${sizeLabel}">
${sizeItems}
        </Preview>
      </section>`);
  }

  // ── Icon sections ─────────────────────────────────────────────────────────
  if (hasLeadingIcon && variantControl) {
    const items = variantControl.options
      .map(opt => `          ${renderComp(` variant="${opt}" leadingIcon={<Plus />}`, opt.charAt(0).toUpperCase() + opt.slice(1))}`)
      .join('\n');
    sections.push(`      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Leading Icon</h2>
        <Preview label="All variants with leadingIcon">
${items}
        </Preview>
      </section>`);
  }

  if (hasTrailingIcon && variantControl) {
    const items = variantControl.options
      .map(opt => `          ${renderComp(` variant="${opt}" trailingIcon={<ArrowRight />}`, opt.charAt(0).toUpperCase() + opt.slice(1))}`)
      .join('\n');
    sections.push(`      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Trailing Icon</h2>
        <Preview label="All variants with trailingIcon">
${items}
        </Preview>
      </section>`);
  }

  // ── Surface showcase ──────────────────────────────────────────────────────
  if (surfaceControl) {
    const nonDefaultSurfaces = surfaceControl.options.filter(
      s => s !== surfaceControl.defaultValue,
    );
    for (const surface of nonDefaultSurfaces) {
      const items = variantControl
        ? variantControl.options
            .map(opt => `          ${renderComp(` variant="${opt}" surface="${surface}"`, opt.charAt(0).toUpperCase() + opt.slice(1))}`)
            .join('\n')
        : `          ${renderComp(` surface="${surface}"`, componentName)}`;
      sections.push(`      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Surface: ${surface.charAt(0).toUpperCase() + surface.slice(1)}</h2>
        <Preview label='surface="${surface}"'>
${items}
        </Preview>
      </section>`);
    }
  }

  // ── Disabled state ────────────────────────────────────────────────────────
  if (disabledControl && variantControl) {
    const items = variantControl.options
      .map(opt => `          ${renderComp(` variant="${opt}" disabled`, opt.charAt(0).toUpperCase() + opt.slice(1))}`)
      .join('\n');
    sections.push(`      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled</h2>
        <Preview label="Disabled state — all variants">
${items}
        </Preview>
      </section>`);
  }

  // ── Motion section ────────────────────────────────────────────────────────
  if (disableMotionControl) {
    const variantProps = variantControl
      ? variantControl.options
          .map(opt => `          ${renderComp(` variant="${opt}"`, opt.charAt(0).toUpperCase() + opt.slice(1))}`)
          .join('\n')
      : `          ${renderComp('', componentName)}`;

    const disabledMotionVariants = variantControl
      ? variantControl.options
          .map(opt => `          ${renderComp(` variant="${opt}" disableMotion`, opt.charAt(0).toUpperCase() + opt.slice(1))}`)
          .join('\n')
      : `          ${renderComp(' disableMotion', componentName)}`;

    sections.push(`      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion</h2>
        <Preview label="Hover / press to see spring animation">
${variantProps}
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion Disabled</h2>
        <p className="text-sm text-zinc-500 mb-3">Use <code className="text-xs bg-zinc-100 px-1 rounded">disableMotion</code> to render with no animation overhead.</p>
        <Preview label="disableMotion — no spring animation">
${disabledMotionVariants}
        </Preview>
      </section>`);
  }

  // ── Other select controls ─────────────────────────────────────────────────
  for (const ctrl of otherSelectControls) {
    const label = ctrl.label ?? ctrl.name;
    const capitalised = label.charAt(0).toUpperCase() + label.slice(1);
    const variantProp = variantControl ? ` variant="${defaultVariant}"` : '';
    const sizeProp = defaultSize ? ` size="${defaultSize}"` : '';
    const items = ctrl.options
      .map(opt => `          ${renderComp(`${variantProp}${sizeProp} ${ctrl.name}="${opt}"`, opt.charAt(0).toUpperCase() + opt.slice(1))}`)
      .join('\n');
    sections.push(`      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">${capitalised}</h2>
        <Preview label="${ctrl.options.join(' / ')}">
${items}
        </Preview>
      </section>`);
  }

  // ── Build usage snippet ───────────────────────────────────────────────────
  const usageLines: string[] = [
    `import { ${componentName} } from '${importPath}';`,
    ...(hasIconProps ? [`import { Plus, ArrowRight, Check } from 'lucide-react';`] : []),
    ``,
  ];

  if (variantControl) {
    for (const opt of variantControl.options) {
      usageLines.push(`<${componentName} variant="${opt}">${opt.charAt(0).toUpperCase() + opt.slice(1)}</${componentName}>`);
    }
  } else {
    usageLines.push(`<${componentName}>${componentName}</${componentName}>`);
  }

  if (surfaceControl) {
    const nonDefault = surfaceControl.options.filter(s => s !== surfaceControl.defaultValue);
    if (nonDefault.length > 0 && variantControl) {
      usageLines.push(``, `{/* Surface */}`);
      usageLines.push(`<${componentName} variant="${defaultVariant}" surface="${nonDefault[0]}">${defaultVariant}</${componentName}>`);
    }
  }

  if (hasLeadingIcon) {
    usageLines.push(``, `{/* Leading icon */}`);
    usageLines.push(`<${componentName}${variantControl ? ` variant="${defaultVariant}"` : ''} leadingIcon={<Plus />}>New item</${componentName}>`);
  }

  if (disableMotionControl) {
    usageLines.push(``, `{/* No animation */}`);
    usageLines.push(`<${componentName}${variantControl ? ` variant="${defaultVariant}"` : ''} disableMotion>${componentName}</${componentName}>`);
  }

  const usageCode = usageLines.join('\n');

  return `import { ${componentName} } from '${importPath}';
import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
${lucideImport}
const PROPS: PropRow[] = [
${propsRows.join('\n')}
];

const USAGE = \`${usageCode.replace(/`/g, '\\`')}\`;

export function ${componentName}Page() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">${componentName}</h1>
        <p className="mt-2 text-sm text-zinc-500">${toTitleCase(componentName)} component.</p>
      </div>

${sections.join('\n\n')}

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
`;
}

// ─── Server Actions ───────────────────────────────────────────────────────────

export async function graduateComponent(params: GraduateParams): Promise<GraduateResult> {
  // ── Guard: dev only ────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Graduation is only available in development mode.' };
  }

  const { componentName, sourcePath, importPath, controls } = params;
  const cwd = process.cwd();
  const slug = toKebabCase(componentName);
  const filesCreated: string[] = [];
  const filesModified: string[] = [];

  // ── Guard: source exists ───────────────────────────────────────────────────
  const absoluteSourcePath = path.join(cwd, sourcePath);
  if (!existsSync(absoluteSourcePath)) {
    return { success: false, error: `Source file not found: ${sourcePath}` };
  }

  try {
    // ── Step 1: Copy source to components/ui/{slug}.tsx ──────────────────────
    const source = readFileSync(absoluteSourcePath, 'utf-8');
    const warnings = runComplianceChecks(source);

    const targetPath = path.join(cwd, 'components', 'ui', `${slug}.tsx`);
    if (!existsSync(targetPath)) {
      writeFileSync(targetPath, source, 'utf-8');
      filesCreated.push(`components/ui/${slug}.tsx`);
    }

    // ── Step 2: Update barrel export ─────────────────────────────────────────
    const barrelPath = path.join(cwd, 'components', 'ui', 'index.ts');
    const barrelContent = readFileSync(barrelPath, 'utf-8');
    if (!barrelContent.includes(`from './${slug}'`)) {
      const camelName = toCamelCase(componentName);
      const variantsName = `${camelName}Variants`;
      const targetContent = readFileSync(targetPath, 'utf-8');
      const hasVariants = targetContent.includes(variantsName);
      const propsTypeName = `${componentName}Props`;
      const hasProps =
        targetContent.includes(`export interface ${propsTypeName}`) ||
        targetContent.includes(`export type ${propsTypeName}`);

      const exportParts = [componentName];
      if (hasVariants) exportParts.push(variantsName);

      const exportLines: string[] = [
        `\nexport { ${exportParts.join(', ')} } from './${slug}';`,
      ];
      if (hasProps) {
        exportLines.push(`export type { ${propsTypeName} } from './${slug}';`);
      }

      writeFileSync(barrelPath, barrelContent + exportLines.join('\n') + '\n', 'utf-8');
      filesModified.push('components/ui/index.ts');
    }

    // ── Step 3: Update viewer registry ───────────────────────────────────────
    const { playgroundSlug, versionLabel } = params;
    const registryPath = path.join(cwd, 'lib', 'viewer-registry.ts');
    const registryContent = readFileSync(registryPath, 'utf-8');
    const registryLines = registryContent.split('\n');

    const graduatedFromStr = `graduatedFrom: { playground: '${playgroundSlug}', version: '${versionLabel}' }`;

    const existingIndex = registryLines.findIndex(
      line => line.includes(`slug: '${slug}'`) && line.includes("section: 'Components'"),
    );

    if (existingIndex !== -1) {
      // Entry exists — update or add graduatedFrom
      let line = registryLines[existingIndex];
      // Strip any existing graduatedFrom field
      line = line.replace(/,?\s*graduatedFrom:\s*\{[^}]*\}/, '');
      // Insert before closing },
      line = line.replace(/\s*\},?\s*$/, `, ${graduatedFromStr} },`);
      registryLines[existingIndex] = line;
      writeFileSync(registryPath, registryLines.join('\n'), 'utf-8');
      filesModified.push('lib/viewer-registry.ts');
    } else {
      // Entry doesn't exist — insert new entry
      let lastComponentsLine = -1;
      for (let i = 0; i < registryLines.length; i++) {
        if (registryLines[i].includes("section: 'Components'")) {
          lastComponentsLine = i;
        }
      }
      if (lastComponentsLine === -1) {
        return { success: false, error: 'Could not find Components section in viewer-registry.ts' };
      }
      const title = toTitleCase(componentName);
      const newEntry = `  { slug: '${slug}', title: '${title}', section: 'Components', route: 'components', layout: 'standard', ${graduatedFromStr} },`;
      registryLines.splice(lastComponentsLine + 1, 0, newEntry);
      writeFileSync(registryPath, registryLines.join('\n'), 'utf-8');
      filesModified.push('lib/viewer-registry.ts');
    }

    // ── Step 4: Generate viewer page ─────────────────────────────────────────
    const pageName = `${componentName}Page`;
    const pageDir = path.join(cwd, 'app', 'components', '[component]');
    const pageFilePath = path.join(pageDir, `${pageName}.tsx`);
    if (!existsSync(pageFilePath)) {
      const pageContent = generateViewerPageContent(componentName, importPath, controls, source);
      writeFileSync(pageFilePath, pageContent, 'utf-8');
      filesCreated.push(`app/components/[component]/${pageName}.tsx`);
    }

    // ── Step 5: Update router ─────────────────────────────────────────────────
    const routerPath = path.join(cwd, 'app', 'components', '[component]', 'page.tsx');
    let routerContent = readFileSync(routerPath, 'utf-8');
    const slugAlreadyInRouter = new RegExp(`['"]${slug}['"]\s*:`).test(routerContent);

    if (!slugAlreadyInRouter) {
      // Insert import after the last local ./SomePage import
      const localImportMatches = [
        ...routerContent.matchAll(/^import \{[^}]+\} from '\.\/[^']+';/gm),
      ];
      if (localImportMatches.length > 0) {
        const lastMatch = localImportMatches[localImportMatches.length - 1];
        const insertAfter = lastMatch.index! + lastMatch[0].length;
        routerContent =
          routerContent.slice(0, insertAfter) +
          `\nimport { ${pageName} } from './${pageName}';` +
          routerContent.slice(insertAfter);
      }

      // Insert entry into COMPONENTS object before its closing };
      const componentsStart = routerContent.indexOf('\nconst COMPONENTS');
      if (componentsStart !== -1) {
        const closingIndex = routerContent.indexOf('\n};', componentsStart);
        if (closingIndex !== -1) {
          // closingIndex points to the \n before };  insert new entry before };
          const newEntry = `  '${slug}': ${pageName},\n`;
          routerContent =
            routerContent.slice(0, closingIndex + 1) +
            newEntry +
            routerContent.slice(closingIndex + 1);
        }
      }

      writeFileSync(routerPath, routerContent, 'utf-8');
      filesModified.push('app/components/[component]/page.tsx');
    }

    return { success: true, slug, filesCreated, filesModified, warnings };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during graduation',
    };
  }
}

export async function verifyGraduation(): Promise<BuildVerification> {
  // ── Guard: dev only ────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    return {
      buildPassed: false,
      buildOutput: 'Verification is only available in development mode.',
      lintPassed: false,
      lintOutput: '',
    };
  }

  const cwd = process.cwd();

  let buildPassed = false;
  let buildOutput = '';
  let lintPassed = false;
  let lintOutput = '';

  try {
    execSync('npm run build', { cwd, timeout: 120_000, encoding: 'utf-8', stdio: 'pipe' });
    buildPassed = true;
    buildOutput = 'Build passed.';
  } catch (err) {
    buildPassed = false;
    const raw = err instanceof Error && 'stdout' in err
      ? String((err as NodeJS.ErrnoException & { stdout?: string; stderr?: string }).stdout ?? '') +
        String((err as NodeJS.ErrnoException & { stdout?: string; stderr?: string }).stderr ?? '')
      : String(err);
    buildOutput = lastNLines(raw, 50);
  }

  try {
    execSync('npm run lint', { cwd, timeout: 60_000, encoding: 'utf-8', stdio: 'pipe' });
    lintPassed = true;
    lintOutput = 'Lint passed.';
  } catch (err) {
    lintPassed = false;
    const raw = err instanceof Error && 'stdout' in err
      ? String((err as NodeJS.ErrnoException & { stdout?: string; stderr?: string }).stdout ?? '') +
        String((err as NodeJS.ErrnoException & { stdout?: string; stderr?: string }).stderr ?? '')
      : String(err);
    lintOutput = lastNLines(raw, 50);
  }

  return { buildPassed, buildOutput, lintPassed, lintOutput };
}
