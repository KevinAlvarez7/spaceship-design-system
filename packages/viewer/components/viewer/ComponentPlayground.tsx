'use client';

import { useState } from 'react';
import { Copy, Check, GraduationCap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Preview } from '@/components/viewer/Preview';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shadcn/tooltip';
import { Badge } from '@/components/shadcn/badge';
import { PropsPanel } from '@/components/viewer/PropsPanel';
import {
  PLAYGROUND_CONFIGS,
  normalizeVersions,
  type ControlDef,
  type PlaygroundVersion,
} from '@/lib/playground-config';
import { COMPONENT_REGISTRY } from '@spaceship/design-system/registry';
import { usePlaygroundState } from '@/lib/use-playground-state';
import { GraduateDialog } from '@/components/viewer/GraduateDialog';
import type { GraduateParams } from '@/app/actions/graduate';

interface ComponentPlaygroundProps {
  slug: string;
}

/** 'ThinkingDots' → 'thinking-dots', 'Button' → 'button' */
function toKebabCase(name: string): string {
  return name.replace(/([A-Z])/g, (m, l, offset) => (offset > 0 ? '-' : '') + l.toLowerCase());
}

// ─── Code snippet generator ───────────────────────────────────────────────────

function generateCodeSnippet(
  componentName: string,
  importPath: string | undefined,
  controls: ControlDef[],
  values: Record<string, unknown>,
  factoryDefaults: Record<string, unknown>,
  editableChildren: boolean,
  defaultChildren: string,
): string {
  const lines: string[] = [];

  // Import line
  if (importPath) {
    lines.push(`import { ${componentName} } from '${importPath}';`);
    lines.push('');
  }

  const propParts: string[] = [];

  for (const control of controls) {
    const val = values[control.name];
    const def = factoryDefaults[control.name];
    if (val === def) continue; // skip unchanged values

    if (control.type === 'boolean') {
      if (val === true) propParts.push(control.name);
      // false non-defaults would be `name={false}`, but all our defaults are false
    } else {
      propParts.push(`${control.name}="${val}"`);
    }
  }

  const propsStr = propParts.length > 0 ? ' ' + propParts.join(' ') : '';

  if (editableChildren) {
    const children = String(values.children ?? defaultChildren);
    lines.push(`<${componentName}${propsStr}>${children}</${componentName}>`);
  } else {
    lines.push(`<${componentName}${propsStr} />`);
  }

  return lines.join('\n');
}

// ─── Version pills ─────────────────────────────────────────────────────────────

function VersionPills({
  versions,
  activeIndex,
  onSelect,
  graduatedVersionLabel,
  onGraduate,
}: {
  versions: PlaygroundVersion[];
  activeIndex: number;
  onSelect: (index: number) => void;
  graduatedVersionLabel: string | undefined;
  onGraduate: () => void;
}) {
  const hasAnyGraduateArea = versions.some(v => v.sourcePath || v.label === graduatedVersionLabel);
  if (versions.length <= 1 && !hasAnyGraduateArea) return null;

  return (
    <div className="flex items-center gap-2 pb-4">
      {versions.map((version, index) => {
        const isActive = index === activeIndex;
        const isThisVersionGraduated = version.label === graduatedVersionLabel;
        const showGraduateButton = !isThisVersionGraduated && !!version.sourcePath;

        return (
          <div key={version.label} className="flex items-center gap-1.5">
            {versions.length > 1 && (
              <button
                onClick={() => onSelect(index)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    isActive ? 'bg-white' : 'bg-zinc-300',
                  )}
                />
                <span>{version.label}</span>
                {version.description && (
                  <span
                    className={cn(
                      'text-xs',
                      isActive ? 'text-zinc-300' : 'text-zinc-400',
                    )}
                  >
                    {version.description}
                  </span>
                )}
              </button>
            )}

            {isThisVersionGraduated && (
              <Badge className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border-green-200 hover:bg-green-50">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Graduated
              </Badge>
            )}

            {showGraduateButton && isActive && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onGraduate}
                    className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    Graduate
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-900 text-white border-zinc-800 text-xs">
                  Graduate this version to components/ui
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PlaygroundContent ────────────────────────────────────────────────────────

function PlaygroundContent({
  slug,
  config: rawConfig,
  activeVersion,
}: {
  slug: string;
  config: (typeof PLAYGROUND_CONFIGS)[string];
  activeVersion: PlaygroundVersion;
}) {
  const {
    values,
    factoryDefaults,
    handleChange,
    handleReset,
    isModified,
  } = usePlaygroundState(slug, activeVersion);

  const [copied, setCopied] = useState(false);

  // Build controls list passed to PropsPanel (append synthetic children control if editable)
  const panelControls: ControlDef[] = activeVersion.editableChildren
    ? [
        ...activeVersion.controls,
        {
          name: 'children',
          type: 'text' as const,
          defaultValue: activeVersion.defaultChildren ?? '',
          label: 'Children',
          placeholder: 'Label text…',
        },
      ]
    : activeVersion.controls;

  // Split children out of values so it can be passed as React children
  const { children: childrenValue, ...componentProps } = values;

  const Component = activeVersion.component;

  const codeSnippet = generateCodeSnippet(
    rawConfig.componentName,
    rawConfig.importPath,
    activeVersion.controls,
    values,
    factoryDefaults,
    !!activeVersion.editableChildren,
    activeVersion.defaultChildren ?? '',
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (non-secure context or permission denied)
    }
  }

  return (
    <div className="flex gap-6">
      {/* Left: preview + code snippet */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Preview>
          <Component {...componentProps}>
            {activeVersion.editableChildren
              ? String(childrenValue ?? activeVersion.defaultChildren ?? '')
              : (activeVersion.defaultChildren ?? null)}
          </Component>
        </Preview>

        {/* Code snippet */}
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Code</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                >
                  {copied
                    ? <Check className="h-3.5 w-3.5 text-green-600" />
                    : <Copy className="h-3.5 w-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 text-white border-zinc-800 text-xs">
                Copy code snippet
              </TooltipContent>
            </Tooltip>
          </div>
          <pre className="overflow-x-auto bg-white p-4 font-mono text-sm text-zinc-800">
            {codeSnippet}
          </pre>
        </div>
      </div>

      {/* Right: props panel */}
      <div className="w-72 shrink-0">
        <PropsPanel
          controls={panelControls}
          values={values}
          onChange={handleChange}
          onReset={handleReset}
          isModified={isModified}
        />
      </div>
    </div>
  );
}

// ─── ComponentPlayground ──────────────────────────────────────────────────────

export function ComponentPlayground({ slug }: ComponentPlaygroundProps) {
  const config = PLAYGROUND_CONFIGS[slug];
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [graduateOpen, setGraduateOpen] = useState(false);
  // Counter increments on each open so GraduateDialog remounts with fresh state
  const [graduateKey, setGraduateKey] = useState(0);

  if (!config) {
    return (
      <div className="text-sm text-zinc-500">No playground config found for &ldquo;{slug}&rdquo;.</div>
    );
  }

  const versions = normalizeVersions(config);
  const activeVersion = versions[activeVersionIndex] ?? versions[0];

  // Determine per-version graduation status
  const confirmedSlug = toKebabCase(config.componentName);
  const registryEntry = COMPONENT_REGISTRY.find(
    entry => entry.slug === confirmedSlug && entry.section === 'Components',
  );
  const graduatedVersionLabel =
    registryEntry?.graduatedFrom?.playground === slug
      ? registryEntry.graduatedFrom.version
      : undefined;

  // Build serializable params for the dialog (only when sourcePath exists)
  const canGraduate = !!activeVersion.sourcePath;
  const graduateParams: GraduateParams | null = canGraduate
    ? {
        playgroundSlug: slug,
        versionLabel: activeVersion.label,
        componentName: config.componentName,
        sourcePath: activeVersion.sourcePath!,
        importPath: config.importPath ?? '@/components/ui',
        controls: activeVersion.controls as GraduateParams['controls'],
      }
    : null;

  return (
    <div className="flex flex-col">
      <VersionPills
        versions={versions}
        activeIndex={activeVersionIndex}
        onSelect={setActiveVersionIndex}
        graduatedVersionLabel={graduatedVersionLabel}
        onGraduate={() => {
          setGraduateKey(k => k + 1);
          setGraduateOpen(true);
        }}
      />
      <PlaygroundContent
        slug={slug}
        config={config}
        activeVersion={activeVersion}
      />
      {graduateParams && (
        <GraduateDialog
          key={graduateKey}
          open={graduateOpen}
          params={graduateParams}
          onClose={() => setGraduateOpen(false)}
        />
      )}
    </div>
  );
}
