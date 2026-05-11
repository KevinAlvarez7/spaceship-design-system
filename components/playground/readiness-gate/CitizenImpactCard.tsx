'use client';

import { motion } from 'motion/react';
import { Tag } from '@/components/ui';
import type { CitizenImpactPersona } from '@/app/_shared/citizen-voices.mock';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Constants ────────────────────────────────────────────────────────────────

const CONFIDENCE_VARIANT = {
  high:   'success',
  medium: 'warning',
  low:    'error',
} as const;

const CONFIDENCE_LABEL = {
  high:   'High confidence',
  medium: 'Medium confidence',
  low:    'Low confidence',
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CitizenImpactCardProps {
  personas:  CitizenImpactPersona[];
  className?: string;
}

// ─── CitizenImpactCard ────────────────────────────────────────────────────────

export function CitizenImpactCard({ personas, className }: CitizenImpactCardProps) {
  return (
    <div className={cn('flex flex-col gap-4 w-full max-w-2xl', className)}>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
          Citizen impact preview
        </p>
        <h3 className="font-serif text-(length:--font-size-xl) leading-(--line-height-xl) font-bold text-(--text-primary)">
          Predicted impact per persona
        </h3>
        <p className="font-sans [font-size:var(--font-size-sm)] text-(--text-secondary)">
          Based on the validated evidence, this is what we&apos;d expect each citizen segment to experience after launch. Anything below high confidence is a place to plan a follow-up measurement.
        </p>
      </div>

      {/* ─── Persona grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {personas.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.interactive, delay: i * 0.04 }}
            className="flex flex-col gap-2 p-3 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border)"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
                  {p.name}
                </span>
                <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
                  {p.context}
                </span>
              </div>
              <Tag size="sm" variant={CONFIDENCE_VARIANT[p.confidence]}>
                {CONFIDENCE_LABEL[p.confidence]}
              </Tag>
            </div>
            <p className="font-sans [font-size:var(--font-size-sm)] text-(--text-secondary)">
              {p.predictedImpact}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
