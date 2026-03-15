#!/usr/bin/env node

/**
 * ds-clean — Delete all version files for a component without promoting.
 *
 * Usage:
 *   node scripts/ds-clean.mjs <component>
 *
 * Example:
 *   node scripts/ds-clean.mjs button
 */

import { readdir, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const UI_DIR = resolve(import.meta.dirname, '..', 'components', 'ui');

const [componentName] = process.argv.slice(2);

if (!componentName) {
  console.error('Usage: node scripts/ds-clean.mjs <component>');
  process.exit(1);
}

const files = await readdir(UI_DIR);
const versionPattern = new RegExp(`^${componentName}\\.v\\d+\\.tsx$`);
const versionFiles = files.filter(f => versionPattern.test(f));

if (versionFiles.length === 0) {
  console.log(`No version files found for ${componentName}.`);
  process.exit(0);
}

for (const f of versionFiles) {
  await unlink(join(UI_DIR, f));
}

console.log(`Cleaned up ${versionFiles.length} version file(s): ${versionFiles.join(', ')}`);
console.log(`${componentName}.tsx is unchanged.`);
