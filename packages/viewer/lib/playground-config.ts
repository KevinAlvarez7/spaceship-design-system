'use client';

import type React from 'react';
import { Button as ButtonV1 } from '@spaceship/design-system/components/playground/button/v1';
import { Button as ButtonV2 } from '@spaceship/design-system/components/playground/button/v2';
import { Tag } from '@spaceship/design-system';
import { ThinkingDots } from '@spaceship/design-system';

// ─── Control types ────────────────────────────────────────────────────────────

export type ControlDef =
  | { name: string; type: 'select';  options: string[]; defaultValue: string;  label?: string; group?: string }
  | { name: string; type: 'boolean'; defaultValue: boolean; label?: string; group?: string }
  | { name: string; type: 'text';    defaultValue: string;  label?: string; placeholder?: string; group?: string };

// ─── Version types ────────────────────────────────────────────────────────────

export type PlaygroundVersion = {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  controls: ControlDef[];
  defaultChildren?: string;
  editableChildren?: boolean;
  description?: string;
  sourcePath?: string;
};

// ─── Config type ──────────────────────────────────────────────────────────────

export type PlaygroundComponentConfig = {
  title: string;
  componentName: string;
  importPath?: string;
  versions: PlaygroundVersion[];
  // Legacy single-version fields (kept for backward compat — normalized at runtime)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: React.ComponentType<any>;
  controls?: ControlDef[];
  defaultChildren?: string;
  editableChildren?: boolean;
  description?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type VersionShape = Pick<PlaygroundVersion, 'controls' | 'editableChildren' | 'defaultChildren'>;

export function getDefaultValues(version: VersionShape): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const control of version.controls) {
    defaults[control.name] = control.defaultValue;
  }
  if (version.editableChildren) {
    defaults['children'] = version.defaultChildren ?? '';
  }
  return defaults;
}

/** Normalize a config so it always has a `versions` array. */
export function normalizeVersions(config: PlaygroundComponentConfig): PlaygroundVersion[] {
  if (config.versions && config.versions.length > 0) return config.versions;
  // Legacy single-version config
  return [
    {
      label: 'v1',
      component: config.component!,
      controls: config.controls!,
      defaultChildren: config.defaultChildren,
      editableChildren: config.editableChildren,
      description: config.description,
    },
  ];
}

// ─── Config registry ──────────────────────────────────────────────────────────

export const PLAYGROUND_CONFIGS: Record<string, PlaygroundComponentConfig> = {
  'pg-button': {
    title: 'Button',
    componentName: 'Button',
    importPath: '@/components/ui',
    versions: [
      {
        label: 'v1',
        description: 'Radial fill, 5 variants',
        component: ButtonV1,
        sourcePath: 'components/playground/button/v1.tsx',
        editableChildren: true,
        defaultChildren: 'Button',
        controls: [
          { name: 'variant',       type: 'select',  options: ['primary', 'secondary', 'ghost', 'success', 'destructive'], defaultValue: 'primary' },
          { name: 'size',          type: 'select',  options: ['sm', 'md', 'icon-sm', 'icon'],                            defaultValue: 'sm' },
          { name: 'surface',       type: 'select',  options: ['default', 'shadow'],                                       defaultValue: 'default' },
          { name: 'disabled',      type: 'boolean', defaultValue: false },
          { name: 'disableMotion', type: 'boolean', defaultValue: false, label: 'Disable Motion' },
        ],
      },
      {
        label: 'v2',
        description: 'Pill shape, scale-only motion',
        component: ButtonV2,
        sourcePath: 'components/playground/button/v2.tsx',
        editableChildren: true,
        defaultChildren: 'Button',
        controls: [
          { name: 'variant',       type: 'select',  options: ['primary', 'ghost', 'destructive'], defaultValue: 'primary' },
          { name: 'size',          type: 'select',  options: ['sm', 'md'],                        defaultValue: 'sm' },
          { name: 'surface',       type: 'select',  options: ['default', 'shadow'],               defaultValue: 'default' },
          { name: 'disabled',      type: 'boolean', defaultValue: false },
          { name: 'disableMotion', type: 'boolean', defaultValue: false, label: 'Disable Motion' },
        ],
      },
    ],
  },

  'pg-tag': {
    title: 'Tag',
    componentName: 'Tag',
    importPath: '@/components/ui',
    versions: [
      {
        label: 'v1',
        component: Tag,
        editableChildren: true,
        defaultChildren: 'Tag',
        controls: [
          { name: 'variant', type: 'select',  options: ['neutral', 'success', 'warning', 'error', 'info'], defaultValue: 'neutral' },
          { name: 'size',    type: 'select',  options: ['sm', 'md'],                                        defaultValue: 'md' },
          { name: 'surface', type: 'select',  options: ['default', 'shadow-border'],                        defaultValue: 'default' },
        ],
      },
    ],
  },

  'pg-thinking-dots': {
    title: 'Thinking Dots',
    componentName: 'ThinkingDots',
    importPath: '@/components/ui',
    versions: [
      {
        label: 'v1',
        component: ThinkingDots,
        controls: [
          { name: 'size',          type: 'select',  options: ['sm', 'md', 'lg'],                                                                       defaultValue: 'md' },
          { name: 'surface',       type: 'select',  options: ['default', 'shadow-border'],                                                             defaultValue: 'default' },
          { name: 'pattern',       type: 'select',  options: ['diagonal', 'radial', 'radial-pull', 'horizontal', 'random', 'breathe', 'breathe-x'],   defaultValue: 'diagonal' },
          { name: 'variant',       type: 'select',  options: ['rainbow', 'subtle'],                                                                     defaultValue: 'rainbow' },
          { name: 'disableMotion', type: 'boolean', defaultValue: false, label: 'Disable Motion' },
        ],
      },
    ],
  },
};
