#!/usr/bin/env node

/**
 * ds-promote — Replace canonical component with a specific version, clean up.
 *
 * Usage:
 *   node scripts/ds-promote.mjs <component> <version>
 *
 * Example:
 *   node scripts/ds-promote.mjs button v2
 */

import { readdir, copyFile, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const UI_DIR = resolve(import.meta.dirname, '..', 'components', 'ui');

const [componentName, version] = process.argv.slice(2);

if (!componentName || !version) {
  console.error('Usage: node scripts/ds-promote.mjs <component> <version>');
  console.error('Example: node scripts/ds-promote.mjs button v2');
  process.exit(1);
}

const versionFile = join(UI_DIR, `${componentName}.${version}.tsx`);
const canonical = join(UI_DIR, `${componentName}.tsx`);

// Copy version over canonical
try {
  await copyFile(versionFile, canonical);
} catch {
  console.error(`Version file not found: ${componentName}.${version}.tsx`);
  process.exit(1);
}

// Delete all version files
const files = await readdir(UI_DIR);
const versionPattern = new RegExp(`^${componentName}\\.v\\d+\\.tsx$`);
const versionFiles = files.filter(f => versionPattern.test(f));

for (const f of versionFiles) {
  await unlink(join(UI_DIR, f));
}

console.log(`Promoted ${componentName}.${version}.tsx → ${componentName}.tsx`);
console.log(`Cleaned up ${versionFiles.length} version file(s): ${versionFiles.join(', ')}`);
