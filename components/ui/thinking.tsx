'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';
import { ThinkingDots } from './thinking-dots';
import { ShimmerText } from './shimmer-text';

// ─── Labels ───────────────────────────────────────────────────────────────────

const SCRAMBLE_LABELS = [
  'Thinking',
  'Launching',
  'Orbiting',
  'Navigating',
  'Charting',
  'Drifting',
  'Scanning',
  'Exploring',
] as const;

// ─── Scramble ─────────────────────────────────────────────────────────────────

const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz~+=*^•·-';
const SCRAMBLE_DURATION = 900;

type ScrambleChar = { char: string; resolved: boolean };

function useTextScramble(target: string, active: boolean): ScrambleChar[] {
  const [chars, setChars] = useState<ScrambleChar[]>(() =>
    target.split('').map(char => ({ char, resolved: true }))
  );
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    startRef.current = null;

    function frame(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / SCRAMBLE_DURATION, 1);

      setChars(
        target.split('').map((char, i) => {
          const resolveAt = (i + 1) / target.length;
          if (char === ' ' || progress >= resolveAt) {
            return { char, resolved: true };
          }
          return {
            char: SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
            resolved: false,
          };
        })
      );

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      }
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, active]);

  if (!active) {
    return target.split('').map(char => ({ char, resolved: true }));
  }
  return chars;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

export const thinkingVariants = cva(
  ['inline-flex items-center', '[font-weight:var(--font-weight-semibold)]', 'font-(family-name:--font-family-secondary)'],
  {
    variants: {
      size: {
        'caption-1': ['gap-1.5', '[font-size:var(--font-size-base)]', 'leading-(--line-height-sm)'],
        'caption-2': ['gap-1',   '[font-size:var(--font-size-sm)]',   'leading-(--line-height-xs)'],
      },
      surface: {
        default:         '',
        'shadow-border': 'rounded-full shadow-(--shadow-border) px-2 py-0.5',
      },
    },
    defaultVariants: { size: 'caption-1', surface: 'default' },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof thinkingVariants> {
  disableMotion?: boolean;
  /** Shimmer style applied to text and dots. Defaults to 'blob'. */
  shimmerVariant?: 'blob' | 'linear' | 'subtle';
  /** Show animated dots after the label. Defaults to true. */
  dots?: boolean;
  /** Cycle through themed loading labels with a character-decode scramble every 3 s. Overrides children. Disabled when disableMotion is set. */
  textScramble?: boolean;
  children?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Thinking({
  size = 'caption-1',
  surface = 'default',
  shimmerVariant = 'blob',
  disableMotion = false,
  dots = true,
  textScramble = false,
  children = 'Thinking',
  className,
  ...props
}: ThinkingProps) {
  const [labelIndex, setLabelIndex] = useState(0);
  const scrambleActive = textScramble && !disableMotion;
  const scrambleChars = useTextScramble(SCRAMBLE_LABELS[labelIndex], scrambleActive);

  useEffect(() => {
    if (!scrambleActive) return;
    const id = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % SCRAMBLE_LABELS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [scrambleActive]);

  let content: ReactNode;

  if (scrambleActive) {
    content = (
      <>
        <ThinkingDots size="sm" pattern="radial" variant={shimmerVariant === 'subtle' ? 'subtle' : 'rainbow'} disableMotion={disableMotion} />
        <ShimmerText variant={shimmerVariant} disableMotion={disableMotion} dots={dots}>
          {scrambleChars.map((c, i) => (
            <span key={i}>{c.char}</span>
          ))}
        </ShimmerText>
      </>
    );
  } else {
    content = (
      <>
        <ThinkingDots size="sm" pattern="radial" variant={shimmerVariant === 'subtle' ? 'subtle' : 'rainbow'} disableMotion={disableMotion} />
        <ShimmerText variant={shimmerVariant} disableMotion={disableMotion} dots={dots}>{children}</ShimmerText>
      </>
    );
  }

  if (disableMotion) {
    return (
      <span className={cn(thinkingVariants({ size, surface }), className)} {...props}>
        {content}
      </span>
    );
  }

  return (
    <motion.span
      className={cn(thinkingVariants({ size, surface }), className)}
      {...(props as object)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springs.gentle}
    >
      {content}
    </motion.span>
  );
}
