#!/usr/bin/env node

/**
 * ds-versions — List all version files for a component.
 *
 * Usage:
 *   node scripts/ds-versions.mjs <component>
 *   node scripts/ds-versions.mjs             # list all components with versions
 */

import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const UI_DIR = resolve(import.meta.dirname, '..', 'components', 'ui');

const [componentName] = process.argv.slice(2);

const files = await readdir(UI_DIR);

if (componentName) {
  // List versions for a specific component
  const versionPattern = new RegExp(`^${componentName}\\.v(\\d+)\\.tsx$`);
  const versions = files
    .map(f => f.match(versionPattern))
    .filter(Boolean)
    .map(m => ({ file: m[0], version: `v${m[1]}`, num: parseInt(m[1], 10) }))
    .sort((a, b) => a.num - b.num);

  if (versions.length === 0) {
    console.log(`No versions for ${componentName}.`);
  } else {
    console.log(`Versions for ${componentName}:`);
    for (const v of versions) {
      console.log(`  ${v.version}  →  ${v.file}`);
    }
  }
} else {
  // List all components that have versions
  const versionPattern = /^(.+)\.v(\d+)\.tsx$/;
  const grouped = new Map();

  for (const f of files) {
    const match = f.match(versionPattern);
    if (match) {
      const name = match[1];
      if (!grouped.has(name)) grouped.set(name, []);
      grouped.get(name).push(`v${match[2]}`);
    }
  }

  if (grouped.size === 0) {
    console.log('No components have versions.');
  } else {
    for (const [name, versions] of grouped) {
      console.log(`${name}: ${versions.sort().join(', ')}`);
    }
  }
}
