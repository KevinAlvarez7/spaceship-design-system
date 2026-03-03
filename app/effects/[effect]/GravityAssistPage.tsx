'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { GravityAssist } from '@/components/effects';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';

// ── Types ──────────────────────────────────────────────────────────────────────

type DemoMode = 'cursor' | 'drag' | 'animate' | 'impact';
type ColorMode = 'neutral' | 'rainbow';
type ForceDirection = 'pull' | 'push';
type GravitySources = Array<{ x: number; y: number; mass?: number }>;

// ── Card + orbit definitions ───────────────────────────────────────────────────

interface CardDef {
  id: string;
  label: string;
  x: number;
  y: number;
  mass: number;
}

const INITIAL_CARDS: CardDef[] = [
  { id: 'a', label: 'Auth Service',  x: 160, y: 140, mass: 22 },
  { id: 'b', label: 'Data Pipeline', x: 480, y: 260, mass: 14 },
  { id: 'c', label: 'Edge Cache',    x: 320, y: 380, mass: 8  },
];

interface OrbitConfig {
  rx: number; ry: number; speed: number; phase: number; mass: number; label: string;
}

const ORBIT_CONFIGS: OrbitConfig[] = [
  { rx: 200, ry: 110, speed: 0.7,  phase: 0,                 mass: 22, label: 'Auth Service'  },
  { rx: 160, ry: 90,  speed: -0.5, phase: Math.PI * 2 / 3,   mass: 14, label: 'Data Pipeline' },
  { rx: 110, ry: 75,  speed: 1.1,  phase: Math.PI * 4 / 3,   mass: 8,  label: 'Edge Cache'    },
];

const ANIMATE_CARDS: CardDef[] = ORBIT_CONFIGS.map((cfg, i) => ({
  id: `orbit-${i}`, label: cfg.label, x: 0, y: 0, mass: cfg.mass,
}));

const MODES: DemoMode[] = ['cursor', 'drag', 'animate', 'impact'];

// ── Props table ────────────────────────────────────────────────────────────────

const PROPS: PropRow[] = [
  { name: 'radius',          type: 'number',                               default: '150',                    description: 'Gravitational influence radius in pixels' },
  { name: 'mass',            type: 'number',                               default: '18',                     description: 'Deformation strength at the cursor' },
  { name: 'softness',        type: 'number',                               default: '65',                     description: 'Smoothing factor for displacement falloff' },
  { name: 'spring',          type: 'number',                               default: '0.08',                   description: 'Return-to-rest speed (0–1)' },
  { name: 'cols',            type: 'number',                               default: '52',                     description: 'Number of grid columns' },
  { name: 'rows',            type: 'number',                               default: '36',                     description: 'Number of grid rows' },
  { name: 'background',      type: 'string',                               default: "'#fafafa'",              description: 'Canvas background color' },
  { name: 'lineColorBase',   type: 'string',                               default: "'#e4e4e7'",              description: 'Grid line color at rest (neutral-200)' },
  { name: 'lineColorActive', type: 'string',                               default: "'#d4d4d8'",              description: 'Grid line color under gravitational influence (neutral-300)' },
  { name: 'lineColors',      type: 'string[]',                             default: '[]',                     description: 'Ordered ring of hex colors for angle-based rainbow. Colors are evenly spaced around 360° from each source.' },
  { name: 'dotColor',        type: 'string',                               default: 'rgba(161,161,170,0.18)', description: 'Vertex dot color (neutral-400 @ 18%)' },
  { name: 'massColor',       type: 'string',                               default: 'rgba(113,113,122,0.22)', description: 'Cursor mass indicator color (neutral-500 @ 22%)' },
  { name: 'sources',         type: 'Array<{ x, y, mass? }>',              default: '[]',                     description: 'External gravity sources (prop-based). Each entry warps the grid at that position.' },
  { name: 'sourcesRef',      type: 'RefObject<Array<{x,y,mass?}> | null>', default: 'undefined',             description: 'Ref-based source list for zero-rerender updates. Canvas reads on each RAF tick.' },
  { name: 'invert',          type: 'boolean',                              default: 'false',                  description: 'When true, vertices are repelled away from gravity sources instead of attracted.' },
];

// ── Usage ──────────────────────────────────────────────────────────────────────

const USAGE = `import { GravityAssist } from '@/components/effects';

// Cursor mode — move mouse over canvas
<div style={{ position: 'relative', height: 480 }}>
  <GravityAssist />
</div>

// Rainbow mode — angle-based brand colors around each gravity source
<div style={{ position: 'relative', height: 480 }}>
  <GravityAssist
    lineColors={[
      '#f9614d',  // Solar Coral 500
      '#f9c600',  // Lumen Yellow 500
      '#26e6b5',  // Nova Mint 500
      '#3c7dff',  // Orbit Blue 500
      '#9b6bff',  // Cosmic Lilac 500
    ]}
  />
</div>

// Push mode — vertices repelled away from the source
<div style={{ position: 'relative', height: 480 }}>
  <GravityAssist invert />
</div>

// Ref-based sources — zero re-renders during interaction
const sourcesRef = useRef(null);
// write sourcesRef.current from a RAF loop, drag handler, etc.
<div style={{ position: 'relative', height: 480 }}>
  <GravityAssist sourcesRef={sourcesRef} lineColors={[...]} />
</div>`;

// ── useDragMode ────────────────────────────────────────────────────────────────

function useDragMode(
  active: boolean,
  sourcesRef: React.MutableRefObject<GravitySources | null>,
) {
  const [cards, setCards] = useState<CardDef[]>(INITIAL_CARDS);
  // Mutable mirror so the drag handler reads/writes without re-renders
  const cardsRef = useRef<CardDef[]>(INITIAL_CARDS);
  useLayoutEffect(() => { cardsRef.current = cards; });

  useEffect(() => {
    if (!active) {
      sourcesRef.current = null;
      return;
    }
    sourcesRef.current = cardsRef.current.map(c => ({ x: c.x, y: c.y, mass: c.mass }));
  }, [active, cards, sourcesRef]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, cardId: string) => {
      const el = e.currentTarget as HTMLElement;
      const container = el.parentElement!.getBoundingClientRect();
      const card = cardsRef.current.find(c => c.id === cardId)!;
      const offsetX = e.clientX - container.left - card.x;
      const offsetY = e.clientY - container.top - card.y;
      el.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const nx = ev.clientX - container.left - offsetX;
        const ny = ev.clientY - container.top - offsetY;
        const idx = cardsRef.current.findIndex(c => c.id === cardId);
        if (idx >= 0) cardsRef.current[idx] = { ...cardsRef.current[idx], x: nx, y: ny };
        // Zero-rerender source update
        sourcesRef.current = cardsRef.current.map(c => ({ x: c.x, y: c.y, mass: c.mass }));
        // Direct DOM update — no React re-render
        el.style.transform = `translate(${nx - 56}px, ${ny - 28}px)`;
      };

      const onUp = () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        // Flush final positions to React state on drop
        setCards([...cardsRef.current]);
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
    },
    [sourcesRef],
  );

  return { cards, handlePointerDown };
}

// ── useAnimateMode ─────────────────────────────────────────────────────────────

function useAnimateMode(
  active: boolean,
  containerRef: React.RefObject<HTMLDivElement | null>,
  sourcesRef: React.MutableRefObject<GravitySources | null>,
) {
  const cardElsRef = useRef<(HTMLElement | null)[]>([null, null, null]);
  const rafRef = useRef<number>(0);

  useLayoutEffect(() => {
    cancelAnimationFrame(rafRef.current);

    if (!active) {
      sourcesRef.current = null;
      return;
    }

    const container = containerRef.current;
    const rect = container?.getBoundingClientRect();
    const cx0 = rect ? rect.width / 2 : 300;
    const cy0 = rect ? rect.height / 2 : 240;

    // Set initial positions synchronously (before paint) — avoids 1-frame flash at (0,0)
    sourcesRef.current = ORBIT_CONFIGS.map((cfg, i) => {
      const x = cx0 + cfg.rx * Math.cos(cfg.phase);
      const y = cy0 + cfg.ry * Math.sin(cfg.phase);
      const el = cardElsRef.current[i];
      if (el) el.style.transform = `translate(${x - 56}px, ${y - 28}px)`;
      return { x, y, mass: cfg.mass };
    });

    const startTime = performance.now();

    function tick(now: number) {
      const t = (now - startTime) / 1000;
      const r = containerRef.current?.getBoundingClientRect();
      const cx = r ? r.width / 2 : cx0;
      const cy = r ? r.height / 2 : cy0;
      sourcesRef.current = ORBIT_CONFIGS.map((cfg, i) => {
        const x = cx + cfg.rx * Math.cos(t * cfg.speed + cfg.phase);
        const y = cy + cfg.ry * Math.sin(t * cfg.speed + cfg.phase);
        const el = cardElsRef.current[i];
        if (el) el.style.transform = `translate(${x - 56}px, ${y - 28}px)`;
        return { x, y, mass: cfg.mass };
      });
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      sourcesRef.current = null;
    };
  }, [active, containerRef, sourcesRef]);

  return { cardElsRef };
}

// ── useImpactMode ──────────────────────────────────────────────────────────────

interface Impact {
  x: number; y: number; mass: number; startTime: number; duration: number;
}

function useImpactMode(
  active: boolean,
  sourcesRef: React.MutableRefObject<GravitySources | null>,
) {
  const impactsRef = useRef<Impact[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      impactsRef.current = [];
      sourcesRef.current = null;
      return;
    }

    function tick(now: number) {
      // Remove expired impacts
      impactsRef.current = impactsRef.current.filter(
        imp => now - imp.startTime < imp.duration,
      );

      if (impactsRef.current.length > 0) {
        sourcesRef.current = impactsRef.current.map(imp => {
          const t = (now - imp.startTime) / imp.duration;
          const decayed = imp.mass * (1 - t) * (1 - t); // ease-out quadratic
          return { x: imp.x, y: imp.y, mass: decayed };
        });
      } else {
        sourcesRef.current = null; // fall back to cursor between impacts
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      sourcesRef.current = null;
    };
  }, [active, sourcesRef]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!active) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      impactsRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        mass: 30,
        startTime: performance.now(),
        duration: 600,
      });
    },
    [active],
  );

  return { handleClick };
}

// ── ModeToggle ────────────────────────────────────────────────────────────────

function ModeToggle({
  mode,
  onChange,
}: {
  mode: DemoMode;
  onChange: (m: DemoMode) => void;
}) {
  return (
    <div className="flex gap-0.5 bg-zinc-100 rounded-md p-0.5 text-xs">
      {MODES.map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={
            mode === m
              ? 'bg-white text-zinc-900 shadow-sm rounded px-3 py-1 capitalize'
              : 'text-zinc-500 hover:text-zinc-700 px-3 py-1 capitalize'
          }
        >
          {m}
        </button>
      ))}
    </div>
  );
}

// ── ColorModeToggle ──────────────────────────────────────────────────────────

function ColorModeToggle({
  colorMode,
  onChange,
}: {
  colorMode: ColorMode;
  onChange: (m: ColorMode) => void;
}) {
  return (
    <div className="flex gap-0.5 bg-zinc-100 rounded-md p-0.5 text-xs">
      {(['neutral', 'rainbow'] as ColorMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={
            colorMode === m
              ? 'bg-white text-zinc-900 shadow-sm rounded px-3 py-1 capitalize'
              : 'text-zinc-500 hover:text-zinc-700 px-3 py-1 capitalize'
          }
        >
          {m}
        </button>
      ))}
    </div>
  );
}

// ── ForceToggle ───────────────────────────────────────────────────────────────

function ForceToggle({
  forceDir,
  onChange,
}: {
  forceDir: ForceDirection;
  onChange: (d: ForceDirection) => void;
}) {
  return (
    <div className="flex gap-0.5 bg-zinc-100 rounded-md p-0.5 text-xs">
      {(['pull', 'push'] as ForceDirection[]).map(d => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={
            forceDir === d
              ? 'bg-white text-zinc-900 shadow-sm rounded px-3 py-1 capitalize'
              : 'text-zinc-500 hover:text-zinc-700 px-3 py-1 capitalize'
          }
        >
          {d}
        </button>
      ))}
    </div>
  );
}

// ── DemoCard ──────────────────────────────────────────────────────────────────

function DemoCard({
  card,
  onPointerDown,
  refCallback,
  style,
}: {
  card: CardDef;
  onPointerDown?: (e: React.PointerEvent, id: string) => void;
  refCallback?: (el: HTMLElement | null) => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      ref={refCallback}
      onPointerDown={onPointerDown ? e => onPointerDown(e, card.id) : undefined}
      className="absolute select-none rounded-lg border border-zinc-300 bg-white/60 backdrop-blur-sm px-3 py-2 text-center"
      style={{
        transform: `translate(${card.x - 56}px, ${card.y - 28}px)`,
        width: 112,
        willChange: 'transform',
        cursor: onPointerDown ? 'grab' : 'default',
        ...style,
      }}
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 leading-none mb-0.5">
        mass {card.mass}
      </p>
      <p className="text-xs font-semibold text-zinc-700 leading-tight truncate">
        {card.label}
      </p>
    </div>
  );
}

// ── Preview area (shared between page and modal) ───────────────────────────────

const BRAND_COLORS = [
  '#f9614d',  // Solar Coral 500
  '#f9c600',  // Lumen Yellow 500
  '#26e6b5',  // Nova Mint 500
  '#3c7dff',  // Orbit Blue 500
  '#9b6bff',  // Cosmic Lilac 500
];

interface PreviewAreaProps {
  radius: number;
  mass: number;
  softness: number;
  spring: number;
  colorMode: ColorMode;
  forceDir: ForceDirection;
  mode: DemoMode;
  containerRef: React.RefObject<HTMLDivElement | null>;
  sourcesRef: React.MutableRefObject<GravitySources | null>;
  dragCards: CardDef[];
  handlePointerDown: (e: React.PointerEvent, id: string) => void;
  animCardElsRef: React.MutableRefObject<(HTMLElement | null)[]>;
  handleImpactClick: (e: React.MouseEvent) => void;
  className?: string;
}

function PreviewArea({
  radius, mass, softness, spring,
  colorMode,
  forceDir,
  mode,
  containerRef, sourcesRef,
  dragCards, handlePointerDown,
  animCardElsRef, handleImpactClick,
  className = 'h-[480px]',
}: PreviewAreaProps) {
  return (
    <div
      ref={containerRef}
      onClick={mode === 'impact' ? handleImpactClick : undefined}
      className={`relative rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 ${className}`}
      style={mode === 'impact' ? { cursor: 'crosshair' } : undefined}
    >
      <GravityAssist
        radius={radius}
        mass={mass}
        softness={softness}
        spring={spring}
        sourcesRef={mode !== 'cursor' ? sourcesRef : undefined}
        lineColors={colorMode === 'rainbow' ? BRAND_COLORS : []}
        invert={forceDir === 'push'}
      />

      {mode === 'drag' && dragCards.map(card => (
        <DemoCard
          key={card.id}
          card={card}
          onPointerDown={handlePointerDown}
        />
      ))}

      {mode === 'animate' && ANIMATE_CARDS.map((card, i) => (
        <DemoCard
          key={card.id}
          card={card}
          refCallback={el => { animCardElsRef.current[i] = el; }}
          style={{ pointerEvents: 'none', cursor: 'default' }}
        />
      ))}

      {mode === 'impact' && (
        <div className="absolute inset-0 flex items-end justify-center pb-5 pointer-events-none">
          <p className="text-xs text-zinc-400 font-mono tracking-wide">
            Click anywhere to create impact
          </p>
        </div>
      )}

      {mode === 'drag' && (
        <div className="absolute inset-0 flex items-end justify-center pb-5 pointer-events-none">
          <p className="text-xs text-zinc-400 font-mono tracking-wide">
            Drag cards — grid warps in real time, zero re-renders
          </p>
        </div>
      )}

      {mode === 'animate' && (
        <div className="absolute inset-0 flex items-end justify-center pb-5 pointer-events-none">
          <p className="text-xs text-zinc-400 font-mono tracking-wide">
            Cards orbit via RAF loop — no React renders during animation
          </p>
        </div>
      )}
    </div>
  );
}

// ── GravityAssistPage ──────────────────────────────────────────────────────────

export function GravityAssistPage() {
  const [radius, setRadius] = useState(150);
  const [mass, setMass] = useState(18);
  const [softness, setSoftness] = useState(65);
  const [springRaw, setSpringRaw] = useState(8);
  const [fullscreen, setFullscreen] = useState(false);
  const [mode, setMode] = useState<DemoMode>('cursor');
  const [colorMode, setColorMode] = useState<ColorMode>('rainbow');
  const [forceDir, setForceDir] = useState<ForceDirection>('pull');

  const containerRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<GravitySources | null>(null as GravitySources | null);

  const { cards: dragCards, handlePointerDown } = useDragMode(mode === 'drag', sourcesRef);
  const { cardElsRef: animCardElsRef } = useAnimateMode(mode === 'animate', containerRef, sourcesRef);
  const { handleClick: handleImpactClick } = useImpactMode(mode === 'impact', sourcesRef);

  return (
    <div className="max-w-3xl space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Gravity Assist</h1>
          <ExperimentBadge />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          An analytic gravitational displacement field. Each vertex finds its target
          analytically — no springs, no velocity accumulation, just math.
        </p>
      </div>

      {/* Preview */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Preview</h2>
        <PreviewArea
          radius={radius} mass={mass} softness={softness} spring={springRaw / 100}
          colorMode={colorMode}
          forceDir={forceDir}
          mode={mode}
          containerRef={containerRef} sourcesRef={sourcesRef}
          dragCards={dragCards} handlePointerDown={handlePointerDown}
          animCardElsRef={animCardElsRef} handleImpactClick={handleImpactClick}
        />
        <div className="flex items-center gap-3 mt-3">
          <ForceToggle forceDir={forceDir} onChange={setForceDir} />
          <ColorModeToggle colorMode={colorMode} onChange={setColorMode} />
          <ModeToggle mode={mode} onChange={setMode} />
          <button
            onClick={() => setFullscreen(true)}
            className="text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 rounded-md px-4 py-2 transition-colors"
          >
            Open Full Screen
          </button>
        </div>
      </section>

      {/* Props */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <div className="relative rounded-lg border border-zinc-200 overflow-hidden text-sm">
          <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-4 py-2">
            <span className="text-xs text-zinc-400 font-mono">tsx</span>
          </div>
          <pre className="overflow-x-auto p-4 bg-white text-xs text-zinc-800 font-mono leading-relaxed m-0">
            <code>{USAGE}</code>
          </pre>
        </div>
      </section>

      {/* Fullscreen Modal */}
      <FullScreenModal
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        radius={radius}
        mass={mass}
        softness={softness}
        spring={springRaw / 100}
        springRaw={springRaw}
        onRadiusChange={setRadius}
        onMassChange={setMass}
        onSoftnessChange={setSoftness}
        onSpringRawChange={setSpringRaw}
      />
    </div>
  );
}

// ── FullScreenModal ────────────────────────────────────────────────────────────

interface FullScreenModalProps {
  open: boolean;
  onClose: () => void;
  radius: number;
  mass: number;
  softness: number;
  spring: number;
  springRaw: number;
  onRadiusChange: (v: number) => void;
  onMassChange: (v: number) => void;
  onSoftnessChange: (v: number) => void;
  onSpringRawChange: (v: number) => void;
}

function FullScreenModal({
  open, onClose,
  radius, mass, softness, spring, springRaw,
  onRadiusChange, onMassChange, onSoftnessChange, onSpringRawChange,
}: FullScreenModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<DemoMode>('cursor');
  const [colorMode, setColorMode] = useState<ColorMode>('rainbow');
  const [forceDir, setForceDir] = useState<ForceDirection>('pull');

  // Each modal instance gets its own refs + hook instances
  const containerRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<GravitySources | null>(null as GravitySources | null);
  const { cards: dragCards, handlePointerDown } = useDragMode(mode === 'drag', sourcesRef);
  const { cardElsRef: animCardElsRef } = useAnimateMode(mode === 'animate', containerRef, sourcesRef);
  const { handleClick: handleImpactClick } = useImpactMode(mode === 'impact', sourcesRef);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-screen h-screen max-w-none max-h-none m-0 p-0 bg-zinc-50 border-none"
    >
      <div className="relative w-full h-full">
        <PreviewArea
          radius={radius} mass={mass} softness={softness} spring={spring}
          colorMode={colorMode}
          forceDir={forceDir}
          mode={mode}
          containerRef={containerRef} sourcesRef={sourcesRef}
          dragCards={dragCards} handlePointerDown={handlePointerDown}
          animCardElsRef={animCardElsRef} handleImpactClick={handleImpactClick}
          className="w-full h-full rounded-none border-none"
        />

        {/* Overlay: header + stat cards + sliders */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 select-none pointer-events-none">
          <div className="text-center mb-10">
            <p className="text-[10px] font-mono tracking-[0.45em] uppercase text-zinc-400 mb-4">
              Spacetime Curvature
            </p>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-800 mb-3">
              Gravity Assist
            </h1>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed mx-auto">
              An analytic gravitational displacement field. Each vertex finds
              its target analytically — no springs, no velocity accumulation,
              just math.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <StatCard label="Radius"   value={`${radius}px`} />
            <StatCard label="Mass"     value={String(mass)} />
            <StatCard label="Softness" value={String(softness)} />
            <StatCard label="Spring"   value={(springRaw / 100).toFixed(2)} />
          </div>

          <div className="flex items-end gap-6 pointer-events-auto">
            <Slider label="Radius"   value={radius}    min={60}  max={600} onChange={onRadiusChange} />
            <Slider label="Mass"     value={mass}      min={1}   max={50}  onChange={onMassChange} />
            <Slider label="Softness" value={softness}  min={1}   max={100} onChange={onSoftnessChange} />
            <Slider label="Spring"   value={springRaw} min={1}   max={20}  onChange={onSpringRawChange} />
            <ForceToggle forceDir={forceDir} onChange={setForceDir} />
            <ColorModeToggle colorMode={colorMode} onChange={setColorMode} />
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => dialogRef.current?.close()}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors pointer-events-auto"
          aria-label="Close full screen"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-300 bg-white/60 backdrop-blur-sm px-5 py-4 min-w-[104px] text-center">
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1">
        {label}
      </p>
      <p className="text-xl font-semibold text-zinc-800 tabular-nums">{value}</p>
    </div>
  );
}

// ── Slider ────────────────────────────────────────────────────────────────────

function Slider({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: 72, cursor: 'pointer', accentColor: 'rgba(113,113,122,0.6)' }}
        className="appearance-none h-px bg-zinc-300 outline-none"
      />
    </div>
  );
}
