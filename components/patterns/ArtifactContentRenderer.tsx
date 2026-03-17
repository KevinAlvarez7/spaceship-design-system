'use client';

import ReactMarkdown from 'react-markdown';
import { Eye, Smartphone } from 'lucide-react';
import { type Artifact } from '@/app/patterns/_shared/artifactData';

interface ArtifactContentRendererProps {
  artifact: Artifact;
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

  if (artifact.type === 'prototype') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 bg-(--bg-surface-secondary)">
        <div className="flex items-center justify-center size-16 rounded-2xl bg-(--bg-surface-tertiary) shadow-(--shadow-border)">
          <Smartphone className="size-8 text-(--text-tertiary)" />
        </div>
        <div className="text-center">
          <p className="font-sans [font-size:var(--font-size-base)] [font-weight:var(--font-weight-bold)] text-(--text-secondary)">
            Prototype Ready
          </p>
          <p className="font-sans [font-size:var(--font-size-sm)] text-(--text-tertiary) mt-1">
            Share this link with your test participants to begin user testing
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
    <div className="flex flex-1 overflow-auto bg-(--bg-surface-primary) p-6">
      <div
        className={[
          'flex flex-col w-full max-w-2xl font-(family-name:--font-family-mono)',
          '[&_h2]:[font-size:var(--font-size-lg)] [&_h2]:[font-weight:var(--font-weight-bold)] [&_h2]:text-(--text-primary) [&_h2]:mt-8 [&_h2]:mb-3 [&_h2:first-child]:mt-0',
          '[&_h3]:[font-size:var(--font-size-base)] [&_h3]:[font-weight:var(--font-weight-semibold)] [&_h3]:text-(--text-primary) [&_h3]:mt-5 [&_h3]:mb-2',
          '[&_p]:[font-size:var(--font-size-sm)] [&_p]:[line-height:var(--line-height-sm)] [&_p]:text-(--text-secondary) [&_p]:mb-3 [&_p:last-child]:mb-0',
          '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-3',
          '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-3',
          '[&_li]:[font-size:var(--font-size-sm)] [&_li]:text-(--text-secondary)',
          '[&_strong]:[font-weight:var(--font-weight-semibold)] [&_strong]:text-(--text-primary)',
          '[&_hr]:my-6 [&_hr]:border-(--border-default)',
          '[&_table]:w-full [&_table]:mb-3 [&_table]:border-collapse',
          '[&_th]:[font-size:var(--font-size-sm)] [&_th]:[font-weight:var(--font-weight-semibold)] [&_th]:text-(--text-primary) [&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:border-b [&_th]:border-(--border-default)',
          '[&_td]:[font-size:var(--font-size-sm)] [&_td]:text-(--text-secondary) [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-(--border-default)',
          '[&_blockquote]:pl-4 [&_blockquote]:border-l-2 [&_blockquote]:border-(--border-default) [&_blockquote]:text-(--text-secondary) [&_blockquote]:my-4',
        ].join(' ')}
      >
        <ReactMarkdown>{artifact.content}</ReactMarkdown>
      </div>
    </div>
  );
}
