'use client';

import { useState, useRef, useEffect } from 'react';
import { GridBackground } from '@/components/effects';
import { ChatInputBox, ChatBubble, ChatMessage, ChatThread } from '@/components/ui';
import { ChatPanel } from '@/components/patterns';
import { PropsTable, type PropRow } from '@/components/docs/PropsTable';
import { ExperimentBadge } from '@/components/docs/ExperimentBadge';
import { colorPrimitives } from '@/tokens/colors';
import { useChatDemo } from '@/lib/mocks/useChatDemo';

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type PatternMode = 'none' | 'chat' | 'panel';
type ColorMode = 'neutral' | 'rainbow';

interface EditorConfig {
  showDots: boolean;
  showStaticGrid: boolean;
  step: number;
  dotRadius: number;
  lineWidth: number;
  dotColor: string;
  gridColor: string;
  background: string;
  majorEvery: number;
  majorLineWidth: number;
  majorGridColor: string;
}

// ── Presets ───────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: EditorConfig = {
  showDots: false,
  showStaticGrid: true,
  step: 28,
  dotRadius: 0.9,
  lineWidth: 0.4,
  dotColor: 'var(--neutral-400)',
  gridColor: 'rgba(147, 197, 230, 0.38)',
  background: 'var(--bg-surface-paper)',
  majorEvery: 0,
  majorLineWidth: 1.0,
  majorGridColor: 'var(--neutral-400)',
};

const PRESETS: Array<{ label: string; config: EditorConfig }> = [
  { label: 'Default', config: DEFAULT_CONFIG },
  {
    label: 'Dense dots',
    config: { ...DEFAULT_CONFIG, showStaticGrid: false, step: 24, dotRadius: 1.5, dotColor: 'var(--neutral-700)' },
  },
  {
    label: 'Blueprint',
    config: { ...DEFAULT_CONFIG, showDots: false, lineWidth: 0.8, gridColor: 'var(--orbit-blue-300)', background: 'var(--orbit-blue-50)' },
  },
  {
    label: 'Sparse',
    config: { ...DEFAULT_CONFIG, step: 60, dotRadius: 2.0, dotColor: 'var(--neutral-600)' },
  },
  {
    label: 'Bold grid',
    config: { ...DEFAULT_CONFIG, dotRadius: 1.8, lineWidth: 1.2, dotColor: 'var(--neutral-800)', gridColor: 'var(--neutral-400)' },
  },
  {
    label: 'Graph Paper',
    config: {
      ...DEFAULT_CONFIG,
      showDots: false,
      step: 24,
      lineWidth: 0.4,
      background: '#f9f6ee',
      gridColor: 'rgba(147, 197, 230, 0.22)',
      dotColor: DEFAULT_CONFIG.dotColor,
      majorEvery: 5,
      majorLineWidth: 0.8,
      majorGridColor: 'rgba(147, 197, 230, 0.40)',
    },
  },
  {
    label: 'Drafting',
    config: {
      ...DEFAULT_CONFIG,
      showDots: false,
      step: 24,
      lineWidth: 0.4,
      background: '#f7f4e8',
      gridColor: 'rgba(180, 160, 120, 0.16)',
      dotColor: DEFAULT_CONFIG.dotColor,
      majorEvery: 5,
      majorLineWidth: 0.6,
      majorGridColor: 'rgba(180, 160, 120, 0.30)',
    },
  },
  {
    label: 'Notebook',
    config: {
      ...DEFAULT_CONFIG,
      showDots: false,
      step: 28,
      lineWidth: 0.4,
      background: '#ffffff',
      gridColor: 'rgba(147, 197, 230, 0.38)',
      dotColor: DEFAULT_CONFIG.dotColor,
      majorEvery: 0,
    },
  },
];

// ── Brand colors for rainbow mode ─────────────────────────────────────────────

const BRAND_COLORS = [
  'var(--solar-coral-500)',
  'var(--lumen-yellow-500)',
  'var(--nova-mint-500)',
  'var(--orbit-blue-500)',
  'var(--cosmic-lilac-500)',
];

// ── Snippet generator ─────────────────────────────────────────────────────────

/** Builds a JSX snippet. Colors always included; boolean/number props only when non-default. */
function generateSnippet(cfg: EditorConfig, colorMode: ColorMode): string {
  const parts: string[] = [];
  if (!cfg.showDots) parts.push('showDots={false}');
  if (!cfg.showStaticGrid) parts.push('showStaticGrid={false}');
  if (cfg.step !== DEFAULT_CONFIG.step) parts.push(`step={${cfg.step}}`);
  if (cfg.dotRadius !== DEFAULT_CONFIG.dotRadius) parts.push(`dotRadius={${cfg.dotRadius}}`);
  if (cfg.lineWidth !== DEFAULT_CONFIG.lineWidth) parts.push(`lineWidth={${cfg.lineWidth}}`);
  parts.push(`dotColor="${cfg.dotColor}"`);
  parts.push(`staticGridColor="${cfg.gridColor}"`);
  parts.push(`background="${cfg.background}"`);
  if (colorMode === 'rainbow') {
    parts.push(`colorRing={[...BRAND_COLORS]}`);
  }
  if (cfg.majorEvery > 0) {
    parts.push(`majorEvery={${cfg.majorEvery}}`);
    if (cfg.majorLineWidth !== 1.0) parts.push(`majorLineWidth={${cfg.majorLineWidth}}`);
    parts.push(`majorGridColor="${cfg.majorGridColor}"`);
  }
  return `<GridBackground\n  ${parts.join('\n  ')}\n/>`;
}

// ── Token color picker ────────────────────────────────────────────────────────

const COLOR_GROUPS = (() => {
  const scales = [...new Set(colorPrimitives.map(t => t.scale))];
  return scales.map(scale => ({
    scale,
    tokens: colorPrimitives.filter(t => t.scale === scale),
  }));
})();

/** Extracts the short token name from a var() string. */
function tokenLabel(value: string): string {
  const match = value.match(/^var\(\s*(--[^,)]+)\s*\)/);
  return match ? match[1].replace('--', '') : value;
}

function TokenColorPicker({
  label,
  value,
  onChange,
  upward = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  upward?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setInputValue(value); }, [value]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2 w-full">
        <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 flex-1 text-left min-w-0">
          <div
            className="w-5 h-5 rounded-full border border-zinc-300 shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-zinc-600 truncate">{label}</span>
        </button>
        <input
          className="text-[10px] text-zinc-400 font-mono w-[80px] bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-400 outline-none"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onBlur={() => onChange(inputValue)}
          onKeyDown={e => {
            if (e.key === 'Enter') { onChange(inputValue); (e.target as HTMLInputElement).blur(); }
            if (e.key === 'Escape') { setInputValue(value); (e.target as HTMLInputElement).blur(); }
          }}
        />
      </div>

      {open && (
        <div
          className={[
            'absolute left-0 z-50 bg-white border border-zinc-200 rounded-lg shadow-lg p-3 w-56 max-h-72 overflow-y-auto',
            upward ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
          ].join(' ')}
        >
          {COLOR_GROUPS.map(group => (
            <div key={group.scale} className="mb-3 last:mb-0">
              <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                {group.scale}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.tokens.map(token => {
                  const varStr = `var(${token.cssVar})`;
                  return (
                    <button
                      key={token.cssVar}
                      title={token.name}
                      onClick={() => { onChange(varStr); setOpen(false); }}
                      className={[
                        'w-5 h-5 rounded-full transition-transform hover:scale-110',
                        value === varStr
                          ? 'ring-2 ring-zinc-800 ring-offset-1'
                          : 'ring-1 ring-inset ring-black/10',
                      ].join(' ')}
                      style={{ backgroundColor: varStr }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Local inline controls ─────────────────────────────────────────────────────

function Toggle({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-3.5 h-3.5 cursor-pointer"
        style={{ accentColor: 'rgba(113,113,122,0.8)' }}
      />
      <span className="text-xs text-zinc-600">{label}</span>
    </label>
  );
}

function InlineSlider({
  label, value, min, max, step, format, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="text-xs font-mono text-zinc-700 tabular-nums">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full appearance-none h-px bg-zinc-200 outline-none cursor-pointer"
        style={{ accentColor: 'rgba(113,113,122,0.6)' }}
      />
    </div>
  );
}

// ── PatternToggle ─────────────────────────────────────────────────────────────

const PATTERN_MODES: PatternMode[] = ['none', 'chat', 'panel'];
const PATTERN_LABELS: Record<PatternMode, string> = { none: 'Bare', chat: 'Chat', panel: 'Chat Panel' };

function PatternToggle({ pattern, onChange }: { pattern: PatternMode; onChange: (p: PatternMode) => void }) {
  return (
    <div className="flex gap-0.5 bg-zinc-100 rounded-md p-0.5 text-xs shrink-0">
      {PATTERN_MODES.map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={
            pattern === m
              ? 'bg-white text-zinc-900 shadow-sm rounded px-3 py-1'
              : 'text-zinc-500 hover:text-zinc-700 px-3 py-1'
          }
        >
          {PATTERN_LABELS[m]}
        </button>
      ))}
    </div>
  );
}

// ── ColorModeToggle ───────────────────────────────────────────────────────────

const COLOR_MODES: ColorMode[] = ['neutral', 'rainbow'];
const COLOR_MODE_LABELS: Record<ColorMode, string> = { neutral: 'Neutral', rainbow: 'Rainbow' };

function ColorModeToggle({ colorMode, onChange }: { colorMode: ColorMode; onChange: (m: ColorMode) => void }) {
  return (
    <div className="flex gap-0.5 bg-zinc-100 rounded-md p-0.5 text-xs shrink-0">
      {COLOR_MODES.map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={
            colorMode === m
              ? 'bg-white text-zinc-900 shadow-sm rounded px-3 py-1'
              : 'text-zinc-500 hover:text-zinc-700 px-3 py-1'
          }
        >
          {COLOR_MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}

// ── ChatPanelOverlay ──────────────────────────────────────────────────────────

function ChatPanelOverlay() {
  const [title, setTitle] = useState('Vibe Prototype');
  const { messages, streamedText, isStreaming, inputValue, setInputValue, handleSubmit, handleStop } = useChatDemo();

  return (
    <div className="absolute inset-0 flex flex-col items-center">
      <ChatPanel
        className="w-(--sizing-chat-default)"
        title={title}
        onTitleChange={setTitle}
        onMenuClick={() => {}}
        input={{
          size: 'sm',
          submitLabel: 'Send',
          placeholder: 'Iterate further...',
          value: inputValue,
          onChange: e => setInputValue(e.target.value),
          onSubmit: handleSubmit,
          onStop: isStreaming ? handleStop : undefined,
        }}
      >
        <ChatThread bare className="flex-1 min-h-0">
          {messages.map((msg, i) =>
            msg.role === 'user'
              ? <ChatBubble key={i}>{msg.content}</ChatBubble>
              : <ChatMessage key={i} content={msg.content} />
          )}
          {isStreaming && <ChatMessage content={streamedText} isStreaming />}
        </ChatThread>
      </ChatPanel>
    </div>
  );
}

// ── PatternOverlay ────────────────────────────────────────────────────────────

function PatternOverlay({
  pattern,
  inputValue,
  onInputChange,
  onInputSubmit,
}: {
  pattern: PatternMode;
  inputValue: string;
  onInputChange: (v: string) => void;
  onInputSubmit: () => void;
}) {
  if (pattern === 'none') return null;

  if (pattern === 'chat') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 pointer-events-none">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-semibold text-zinc-800">What do you want to build?</h3>
          <p className="text-sm text-zinc-500">Describe your idea and I&apos;ll help bring it to life</p>
        </div>
        <div className="w-(--sizing-chat-default) pointer-events-auto">
          <ChatInputBox
            placeholder="Explore any problems, prototype any ideas..."
            size="md"
            value={inputValue}
            onChange={e => onInputChange(e.target.value)}
            onSubmit={onInputSubmit}
          />
        </div>
      </div>
    );
  }

  // pattern === 'panel'
  return <ChatPanelOverlay />;
}

// ── PreviewCanvas (shared between inline and fullscreen) ──────────────────────

function PreviewCanvas({
  cfg, pattern, colorRing, inputValue, onInputChange, onInputSubmit, className = '',
}: {
  cfg: EditorConfig;
  pattern: PatternMode;
  colorRing: string[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onInputSubmit: () => void;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <GridBackground
        showDots={cfg.showDots}
        showStaticGrid={cfg.showStaticGrid}
        step={cfg.step}
        dotRadius={cfg.dotRadius}
        lineWidth={cfg.lineWidth}
        dotColor={cfg.dotColor}
        staticGridColor={cfg.gridColor}
        background={cfg.background}
        colorRing={colorRing}
        majorEvery={cfg.majorEvery}
        majorLineWidth={cfg.majorLineWidth}
        majorGridColor={cfg.majorGridColor}
      />
      <PatternOverlay
        pattern={pattern}
        inputValue={inputValue}
        onInputChange={onInputChange}
        onInputSubmit={onInputSubmit}
      />
    </div>
  );
}

// ── CompactSlider (fullscreen HUD style) ──────────────────────────────────────

function CompactSlider({
  label, value, min, max, step = 1, onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-400">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: 72, cursor: 'pointer', accentColor: 'rgba(113,113,122,0.6)' }}
        className="appearance-none h-px bg-zinc-300 outline-none"
      />
    </div>
  );
}

// ── FullScreenModal ────────────────────────────────────────────────────────────

interface FullScreenModalProps {
  open: boolean;
  onClose: () => void;
  cfg: EditorConfig;
  onCfgChange: (patch: Partial<EditorConfig>) => void;
  pattern: PatternMode;
  onPatternChange: (p: PatternMode) => void;
  colorMode: ColorMode;
  onColorModeChange: (m: ColorMode) => void;
  colorRing: string[];
  previewInput: string;
  onPreviewInputChange: (v: string) => void;
  onPreviewSubmit: () => void;
}

function FullScreenModal({
  open, onClose,
  cfg, onCfgChange,
  pattern, onPatternChange,
  colorMode, onColorModeChange,
  colorRing,
  previewInput, onPreviewInputChange, onPreviewSubmit,
}: FullScreenModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

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
      className="w-screen h-screen max-w-none max-h-none m-0 p-0 border-none bg-transparent"
    >
      <div className="relative w-full h-full">
        <PreviewCanvas
          cfg={cfg}
          pattern={pattern}
          colorRing={colorRing}
          inputValue={previewInput}
          onInputChange={onPreviewInputChange}
          onInputSubmit={onPreviewSubmit}
          className="w-full h-full rounded-none"
        />

        {/* Bottom HUD — controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex items-end gap-4 bg-white/80 backdrop-blur-sm rounded-xl border border-zinc-200 shadow-lg px-5 py-3">
            <PatternToggle pattern={pattern} onChange={onPatternChange} />

            <div className="w-px h-6 bg-zinc-200 self-center" />

            <ColorModeToggle colorMode={colorMode} onChange={onColorModeChange} />

            <div className="w-px h-6 bg-zinc-200 self-center" />

            <CompactSlider
              label="Step"
              value={cfg.step}
              min={12}
              max={80}
              onChange={v => onCfgChange({ step: v })}
            />
            <CompactSlider
              label="Dot Radius"
              value={cfg.dotRadius}
              min={0.2}
              max={3.0}
              step={0.1}
              onChange={v => onCfgChange({ dotRadius: v })}
            />
            <CompactSlider
              label="Line Width"
              value={cfg.lineWidth}
              min={0.1}
              max={2.0}
              step={0.1}
              onChange={v => onCfgChange({ lineWidth: v })}
            />
            <CompactSlider
              label="Major"
              value={cfg.majorEvery}
              min={0}
              max={10}
              step={1}
              onChange={v => onCfgChange({ majorEvery: v })}
            />

            <div className="w-px h-6 bg-zinc-200 self-center" />

            <div className="flex flex-col gap-1.5 pb-0.5">
              <Toggle label="Dots" checked={cfg.showDots} onChange={v => onCfgChange({ showDots: v })} />
              <Toggle label="Grid" checked={cfg.showStaticGrid} onChange={v => onCfgChange({ showStaticGrid: v })} />
            </div>

            <div className="w-px h-6 bg-zinc-200 self-center" />

            <div className="flex flex-col gap-2">
              <TokenColorPicker label="Dot"   value={cfg.dotColor}   onChange={v => onCfgChange({ dotColor: v })}   upward />
              <TokenColorPicker label="Grid"  value={cfg.gridColor}  onChange={v => onCfgChange({ gridColor: v })}  upward />
              <TokenColorPicker label="BG"    value={cfg.background} onChange={v => onCfgChange({ background: v })} upward />
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => dialogRef.current?.close()}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors bg-white/70 backdrop-blur-sm rounded-full p-1.5 border border-zinc-200"
          aria-label="Close full screen"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}

// ── Props table ────────────────────────────────────────────────────────────────

const PROPS: PropRow[] = [
  { name: 'background',      type: 'string',              default: 'var(--neutral-50)',          description: 'Canvas fill color. Set to "transparent" to skip the fill entirely.' },
  { name: 'dotColor',        type: 'string',              default: 'var(--effect-gravity-dot)',   description: 'Color of the static dot grid.' },
  { name: 'staticGridColor', type: 'string',              default: 'var(--effect-gravity-grid)',  description: 'Color of the faint static line grid.' },
  { name: 'showDots',        type: 'boolean',             default: 'true',                        description: 'Toggle the dot grid layer.' },
  { name: 'showStaticGrid',  type: 'boolean',             default: 'true',                        description: 'Toggle the static line grid layer.' },
  { name: 'step',            type: 'number',              default: '38',                          description: 'Pixel spacing between dots and grid lines.' },
  { name: 'dotRadius',       type: 'number',              default: '0.9',                         description: 'Radius of each dot in pixels.' },
  { name: 'lineWidth',       type: 'number',              default: '0.4',                         description: 'Stroke width of the grid lines in pixels.' },
  { name: 'colorRing',       type: 'string[]',            default: '[]',   description: 'Angle-based color ring. Each element cycles through the array based on angle from the canvas center, creating a radial rainbow.' },
  { name: 'majorEvery',     type: 'number',              default: '0',    description: 'Draw a heavier major line every N cells. 0 = disabled.' },
  { name: 'majorLineWidth', type: 'number',              default: '1.0',  description: 'Stroke width of major grid lines in pixels.' },
  { name: 'majorGridColor', type: 'string',              default: '—',    description: 'Color for major grid lines. Falls back to staticGridColor when unset.' },
  { name: 'className',       type: 'string',              default: '—',   description: 'Additional class names.' },
  { name: 'style',           type: 'React.CSSProperties', default: '—',   description: 'Inline styles.' },
];

// ── Usage snippet ──────────────────────────────────────────────────────────────

const USAGE = `import { GridBackground } from '@/components/effects';

// Full background layer — fill a positioned container
<div style={{ position: 'relative', height: 300 }}>
  <GridBackground />
  <div style={{ position: 'relative', zIndex: 1 }}>Content</div>
</div>

// Dots only
<GridBackground showStaticGrid={false} />

// Lines only
<GridBackground showDots={false} />

// Composed under GravityWell (suppress GravityWell's own static layers)
<div style={{ position: 'relative', height: 300 }}>
  <GridBackground />
  <GravityWell
    background="transparent"
    showDots={false}
    showStaticGrid={false}
  />
</div>`;

// ── GridBackgroundPage ─────────────────────────────────────────────────────────

export function GridBackgroundPage() {
  const [cfg, setCfg] = useState<EditorConfig>(DEFAULT_CONFIG);
  const [pattern, setPattern] = useState<PatternMode>('chat');
  const [colorMode, setColorMode] = useState<ColorMode>('neutral');
  const [fullscreen, setFullscreen] = useState(false);
  const [previewInput, setPreviewInput] = useState('');

  const update = (patch: Partial<EditorConfig>) => setCfg(prev => ({ ...prev, ...patch }));

  const colorRing = colorMode === 'rainbow' ? BRAND_COLORS : [];
  const snippet = generateSnippet(cfg, colorMode);
  const activePreset = PRESETS.find(p => JSON.stringify(p.config) === JSON.stringify(cfg))?.label;

  return (
    <div className="max-w-3xl space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Grid Background</h1>
          <ExperimentBadge />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          A static canvas layer that renders the dot grid and line grid used inside GravityWell.
          Use it standalone as a textured background, or compose it beneath a GravityWell with
          its own static layers disabled.
        </p>
      </div>

      {/* Interactive editor */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Interactive editor</h2>

        {/* Live preview */}
        <PreviewCanvas
          cfg={cfg}
          pattern={pattern}
          colorRing={colorRing}
          inputValue={previewInput}
          onInputChange={setPreviewInput}
          onInputSubmit={() => setPreviewInput('')}
          className="rounded-lg border border-zinc-200 h-[520px]"
        />

        {/* Toolbar row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <PatternToggle pattern={pattern} onChange={setPattern} />
          <ColorModeToggle colorMode={colorMode} onChange={setColorMode} />
          <button
            onClick={() => setFullscreen(true)}
            className="text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 rounded-md px-4 py-2 transition-colors ml-auto"
          >
            Open Full Screen
          </button>
        </div>

        {/* Preset pills */}
        <div className="flex gap-2 flex-wrap mt-3">
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => setCfg(preset.config)}
              className={[
                'text-xs px-3 py-1.5 rounded-full border transition-colors',
                activePreset === preset.label
                  ? 'bg-zinc-800 text-white border-zinc-800'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400',
              ].join(' ')}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Control panel */}
        <div className="grid grid-cols-3 gap-6 mt-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Toggles</p>
            <Toggle label="Dots"       checked={cfg.showDots}        onChange={v => update({ showDots: v })} />
            <Toggle label="Grid lines" checked={cfg.showStaticGrid}  onChange={v => update({ showStaticGrid: v })} />
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Spacing & size</p>
            <InlineSlider label="Step"        value={cfg.step}       min={12}  max={80}  step={2}   format={v => `${v}px`}    onChange={v => update({ step: v })} />
            <InlineSlider label="Dot radius"  value={cfg.dotRadius}  min={0.2} max={3.0} step={0.1} format={v => v.toFixed(1)} onChange={v => update({ dotRadius: v })} />
            <InlineSlider label="Line width"  value={cfg.lineWidth}  min={0.1} max={2.0} step={0.1} format={v => v.toFixed(1)} onChange={v => update({ lineWidth: v })} />
            <InlineSlider label="Major every" value={cfg.majorEvery} min={0}   max={10}  step={1}   format={v => v === 0 ? 'off' : `every ${v}`} onChange={v => update({ majorEvery: v })} />
            {cfg.majorEvery > 0 && (
              <InlineSlider label="Major width" value={cfg.majorLineWidth} min={0.5} max={3.0} step={0.1} format={v => v.toFixed(1)} onChange={v => update({ majorLineWidth: v })} />
            )}
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Colors</p>
            <TokenColorPicker label="Dot color"   value={cfg.dotColor}       onChange={v => update({ dotColor: v })} />
            <TokenColorPicker label="Grid color"  value={cfg.gridColor}      onChange={v => update({ gridColor: v })} />
            <TokenColorPicker label="Background"  value={cfg.background}     onChange={v => update({ background: v })} />
            {cfg.majorEvery > 0 && (
              <TokenColorPicker label="Major color" value={cfg.majorGridColor} onChange={v => update({ majorGridColor: v })} />
            )}
          </div>
        </div>

        {/* Generated snippet */}
        <div className="relative rounded-lg border border-zinc-200 overflow-hidden text-sm mt-3">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2">
            <span className="text-xs text-zinc-400 font-mono">tsx</span>
            <span className="text-xs text-zinc-400">Generated snippet</span>
          </div>
          <pre className="overflow-x-auto p-4 bg-white text-xs text-zinc-800 font-mono leading-relaxed m-0">
            <code>{snippet}</code>
          </pre>
        </div>
      </section>

      {/* Default */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <div className="relative rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 220 }}>
          <GridBackground />
        </div>
      </section>

      {/* Layers */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Layers</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-zinc-400 mb-2">Dots only</p>
            <div className="relative rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 140 }}>
              <GridBackground showStaticGrid={false} />
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-2">Lines only</p>
            <div className="relative rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 140 }}>
              <GridBackground showDots={false} />
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-2">Both</p>
            <div className="relative rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 140 }}>
              <GridBackground />
            </div>
          </div>
        </div>
      </section>

      {/* Step size */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Step size</h2>
        <div className="grid grid-cols-3 gap-3">
          {[24, 38, 56].map(step => (
            <div key={step}>
              <p className="text-xs text-zinc-400 mb-2">{step}px</p>
              <div className="relative rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 140 }}>
                <GridBackground step={step} />
              </div>
            </div>
          ))}
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

      {/* Fullscreen modal */}
      <FullScreenModal
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        cfg={cfg}
        onCfgChange={update}
        pattern={pattern}
        onPatternChange={setPattern}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
        colorRing={colorRing}
        previewInput={previewInput}
        onPreviewInputChange={setPreviewInput}
        onPreviewSubmit={() => setPreviewInput('')}
      />

    </div>
  );
}
