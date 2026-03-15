import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NextResponse } from 'next/server';

const UI_DIR = resolve(process.cwd(), 'components', 'ui');

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ component: string }> }
) {
  const { component } = await params;

  try {
    const files = await readdir(UI_DIR);
    const versionPattern = new RegExp(`^${component}\\.v(\\d+)\\.tsx$`);
    const versions = files
      .map(f => f.match(versionPattern))
      .filter(Boolean)
      .map(m => ({ id: `v${m![1]}`, num: parseInt(m![1], 10) }))
      .sort((a, b) => a.num - b.num)
      .map(v => v.id);

    return NextResponse.json({ component, versions });
  } catch {
    return NextResponse.json({ component, versions: [] });
  }
}
