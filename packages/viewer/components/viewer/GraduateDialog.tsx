'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, GraduationCap, TriangleAlert, XCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/shadcn/dialog';
import {
  graduateComponent,
  verifyGraduation,
  type GraduateParams,
  type GraduateResult,
  type BuildVerification,
} from '@/app/actions/graduate';

// ─── Types ────────────────────────────────────────────────────────────────────

type DialogState =
  | { phase: 'confirm' }
  | { phase: 'loading' }
  | { phase: 'verifying'; result: Extract<GraduateResult, { success: true }> }
  | { phase: 'success'; result: Extract<GraduateResult, { success: true }>; verification: BuildVerification }
  | { phase: 'error'; message: string };

interface GraduateDialogProps {
  open: boolean;
  params: GraduateParams;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GraduateDialog({ open, params, onClose }: GraduateDialogProps) {
  const [state, setState] = useState<DialogState>({ phase: 'confirm' });

  async function handleGraduate() {
    setState({ phase: 'loading' });
    const result = await graduateComponent(params);
    if (!result.success) {
      setState({ phase: 'error', message: result.error });
      return;
    }
    setState({ phase: 'verifying', result });
    let verification: BuildVerification;
    try {
      verification = await verifyGraduation();
    } catch {
      // Verification crashed — still show success, files are the primary deliverable
      verification = {
        buildPassed: false,
        buildOutput: 'Verification could not run.',
        lintPassed: false,
        lintOutput: '',
      };
    }
    setState({ phase: 'success', result, verification });
  }

  // Derive target slug from componentName for display
  const slug = params.componentName.replace(
    /([A-Z])/g,
    (m, l, offset) => (offset > 0 ? '-' : '') + l.toLowerCase(),
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="p-0 gap-0 rounded-xl border-zinc-200 shadow-2xl [&>button:last-child]:hidden">
      <div className="p-6">
        {/* ── Confirm ─────────────────────────────────────────────────────── */}
        {state.phase === 'confirm' && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                <GraduationCap className="h-5 w-5 text-zinc-700" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Graduate component</h2>
                <p className="text-sm text-zinc-500">Promote to confirmed DS component</p>
              </div>
            </div>

            <dl className="mb-6 space-y-2 rounded-lg bg-zinc-50 p-4 text-sm">
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-zinc-500">Component</dt>
                <dd className="font-mono text-zinc-900">{params.componentName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-zinc-500">Source</dt>
                <dd className="truncate font-mono text-zinc-600">{params.sourcePath}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-zinc-500">Target slug</dt>
                <dd className="font-mono text-zinc-900">{slug}</dd>
              </div>
            </dl>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={handleGraduate}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                Graduate
              </button>
            </div>
          </>
        )}

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {state.phase === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            <p className="text-sm text-zinc-500">Graduating…</p>
          </div>
        )}

        {/* ── Verifying ───────────────────────────────────────────────────── */}
        {state.phase === 'verifying' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-700">Files written successfully</p>
              <p className="text-sm text-zinc-500">Verifying build &amp; lint…</p>
            </div>
          </div>
        )}

        {/* ── Success ─────────────────────────────────────────────────────── */}
        {state.phase === 'success' && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
              <h2 className="text-base font-semibold text-zinc-900">
                {state.result.warnings.length > 0 ? 'Graduated with warnings' : 'Graduated successfully'}
              </h2>
            </div>

            {state.result.filesCreated.length === 0 &&
              state.result.filesModified.length === 0 && (
                <p className="mb-4 text-sm text-zinc-500">
                  All steps already complete — nothing to do.
                </p>
              )}

            {state.result.filesCreated.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Created
                </p>
                <ul className="space-y-1">
                  {state.result.filesCreated.map(f => (
                    <li
                      key={f}
                      className="rounded bg-green-50 px-3 py-1.5 font-mono text-xs text-green-700"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {state.result.filesModified.length > 0 && (
              <div className="mb-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Modified
                </p>
                <ul className="space-y-1">
                  {state.result.filesModified.map(f => (
                    <li
                      key={f}
                      className="rounded bg-blue-50 px-3 py-1.5 font-mono text-xs text-blue-700"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── DS Compliance Warnings ─────────────────────────────────── */}
            {state.result.warnings.length > 0 && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800">
                    {state.result.warnings.length} DS compliance warning{state.result.warnings.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <ul className="space-y-2">
                  {state.result.warnings.map((w, i) => (
                    <li key={i} className="text-xs text-amber-700">
                      <span className="font-mono font-medium">L{w.line}</span>
                      {' — '}
                      <code className="rounded bg-amber-100 px-1">{w.match}</code>
                      {' '}
                      <span>{w.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Build / Lint Results ───────────────────────────────────── */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                Verification
              </p>
              <div className="flex gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    state.verification.buildPassed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {state.verification.buildPassed ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  Build
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    state.verification.lintPassed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {state.verification.lintPassed ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  Lint
                </span>
              </div>

              {!state.verification.buildPassed && state.verification.buildOutput && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                    Build errors ▸
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto rounded bg-red-50 p-3 text-xs text-red-700 whitespace-pre-wrap">
                    {state.verification.buildOutput}
                  </pre>
                </details>
              )}

              {!state.verification.lintPassed && state.verification.lintOutput && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                    Lint errors ▸
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto rounded bg-red-50 p-3 text-xs text-red-700 whitespace-pre-wrap">
                    {state.verification.lintOutput}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                Close
              </button>
              <a
                href={`/components/${state.result.slug}`}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                onClick={onClose}
              >
                View Component →
              </a>
            </div>
          </>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {state.phase === 'error' && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
              <h2 className="text-base font-semibold text-zinc-900">Graduation failed</h2>
            </div>
            <p className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{state.message}</p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
      </DialogContent>
    </Dialog>
  );
}
