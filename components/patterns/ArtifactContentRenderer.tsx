'use client';

import { Eye } from 'lucide-react';
import { type Artifact } from '@/app/patterns/_shared/artifactData';

interface ArtifactContentRendererProps {
  artifact: Artifact;
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={key++}
          className="font-sans [font-size:var(--font-size-base)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-base)] text-(--text-primary) mt-4 mb-1 first:mt-0"
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={key++}
          className="font-sans [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-sm)] text-(--text-primary) mt-3 mb-1"
        >
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li
          key={key++}
          className="font-sans [font-size:var(--font-size-sm)] [line-height:var(--line-height-sm)] text-(--text-secondary) ml-4 list-disc"
        >
          {line.slice(2)}
        </li>
      );
    } else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.+)/);
      if (match) {
        elements.push(
          <li
            key={key++}
            className="font-sans [font-size:var(--font-size-sm)] [line-height:var(--line-height-sm)] text-(--text-secondary) ml-4 list-decimal"
          >
            {match[2]}
          </li>
        );
      }
    } else if (line.startsWith('|')) {
      // Skip table rows — render as plain text
      elements.push(
        <p
          key={key++}
          className="font-sans [font-size:var(--font-size-xs)] [line-height:var(--line-height-sm)] text-(--text-tertiary) font-mono"
        >
          {line}
        </p>
      );
    } else if (line === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p
          key={key++}
          className="font-sans [font-size:var(--font-size-sm)] [line-height:var(--line-height-sm)] text-(--text-secondary)"
        >
          {line}
        </p>
      );
    }
  }

  return elements;
}

export function ArtifactContentRenderer({ artifact }: ArtifactContentRendererProps) {
  if (artifact.type === 'preview') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 bg-(--bg-surface-secondary)">
        <div className="flex items-center justify-center size-16 rounded-2xl bg-(--bg-surface-tertiary) shadow-(--shadow-border)">
          <Eye className="size-8 text-(--text-tertiary)" />
        </div>
        <div className="text-center">
          <p className="font-sans [font-size:var(--font-size-base)] [font-weight:var(--font-weight-bold)] text-(--text-secondary)">
            Live Preview
          </p>
          <p className="font-sans [font-size:var(--font-size-sm)] text-(--text-tertiary) mt-1">
            Preview will appear here once code is generated
          </p>
        </div>
      </div>
    );
  }

  if (artifact.type === 'code') {
    return (
      <div className="flex flex-1 overflow-auto bg-(--bg-surface-secondary) p-4">
        <pre className="font-mono [font-size:var(--font-size-xs)] [line-height:1.6] text-(--text-primary) whitespace-pre overflow-x-auto w-full">
          <code>{artifact.content}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-auto p-6">
      <div className="flex flex-col w-full max-w-2xl">
        {renderMarkdown(artifact.content)}
      </div>
    </div>
  );
}
