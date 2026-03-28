'use client';

import type React from 'react';

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

export const PLAYGROUND_CONFIGS: Record<string, PlaygroundComponentConfig> = {};
