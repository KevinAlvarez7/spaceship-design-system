#!/usr/bin/env node

/**
 * ds-fork — Create version files for a DS component.
 *
 * Usage:
 *   node scripts/ds-fork.mjs <component> [source-version]
 *
 * Examples:
 *   node scripts/ds-fork.mjs button        # copies button.tsx → v1, creates v2
 *   node scripts/ds-fork.mjs button v2     # forks v2 → next available version
 */

import { readdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const UI_DIR = resolve(import.meta.dirname, '..', 'components', 'ui');

const [componentName, sourceVersion] = process.argv.slice(2);

if (!componentName) {
  console.error('Usage: node scripts/ds-fork.mjs <component> [source-version]');
  process.exit(1);
}

const canonical = join(UI_DIR, `${componentName}.tsx`);

// Find existing version files
const files = await readdir(UI_DIR);
const versionPattern = new RegExp(`^${componentName}\\.v(\\d+)\\.tsx$`);
const existingVersions = files
  .map(f => f.match(versionPattern))
  .filter(Boolean)
  .map(m => parseInt(m[1], 10))
  .sort((a, b) => a - b);

if (existingVersions.length === 0 && !sourceVersion) {
  // First fork: copy canonical → v1, then copy → v2
  const v1 = join(UI_DIR, `${componentName}.v1.tsx`);
  const v2 = join(UI_DIR, `${componentName}.v2.tsx`);

  await copyFile(canonical, v1);
  await copyFile(canonical, v2);

  console.log(`Forked ${componentName}:`);
  console.log(`  ${componentName}.v1.tsx  ← copy of current`);
  console.log(`  ${componentName}.v2.tsx  ← copy of current (edit this)`);
} else {
  // Fork from a specific version (or canonical)
  const nextVersion = (existingVersions.at(-1) ?? 0) + 1;
  const sourcePath = sourceVersion
    ? join(UI_DIR, `${componentName}.${sourceVersion}.tsx`)
    : canonical;

  // Verify source exists
  try {
    await readFile(sourcePath);
  } catch {
    console.error(`Source not found: ${sourcePath}`);
    process.exit(1);
  }

  const target = join(UI_DIR, `${componentName}.v${nextVersion}.tsx`);
  await copyFile(sourcePath, target);

  console.log(`Forked ${componentName}:`);
  console.log(`  ${componentName}.v${nextVersion}.tsx  ← copy of ${sourceVersion ?? 'current'}`);
}
