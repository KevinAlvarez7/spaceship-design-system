'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { getDefaultValues, type PlaygroundVersion } from '@/lib/playground-config';

// ─── Module-level reactive localStorage store ─────────────────────────────────
// SSR-safe: reads return null on the server; on the client, React uses the
// null server snapshot during hydration (no mismatch), then re-renders
// post-hydration with the actual localStorage values.

type Listener = () => void;
const _listeners = new Map<string, Set<Listener>>();
const _cache = new Map<string, Record<string, unknown> | null>();

function subscribeToKey(key: string, listener: Listener): () => void {
  if (!_listeners.has(key)) _listeners.set(key, new Set());
  _listeners.get(key)!.add(listener);
  return () => { _listeners.get(key)?.delete(listener); };
}

// Returns a stable object reference as long as the raw localStorage string
// hasn't changed — required for useSyncExternalStore snapshot stability.
function readKey(key: string): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  if (!_cache.has(key)) {
    const raw = localStorage.getItem(key);
    try {
      _cache.set(key, raw ? (JSON.parse(raw) as Record<string, unknown>) : null);
    } catch {
      _cache.set(key, null);
    }
  }
  return _cache.get(key) ?? null;
}

// Updates cache + localStorage, then notifies all subscribers so
// useSyncExternalStore triggers a re-render with the new snapshot.
function writeKey(key: string, value: Record<string, unknown> | null): void {
  if (typeof window === 'undefined') return;
  _cache.set(key, value);
  if (value !== null) {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.removeItem(key);
  }
  _listeners.get(key)?.forEach((l) => l());
}

// ─── usePlaygroundState ────────────────────────────────────────────────────────

export function usePlaygroundState(slug: string, version: PlaygroundVersion | undefined) {
  const versionSuffix = version ? `:${version.label}` : '';
  const workingKey = `pg-working:${slug}${versionSuffix}`;

  const factoryDefaults = useMemo(
    () => (version ? getDefaultValues(version) : {}),
    [version],
  );

  // Stable subscribe callbacks — identity only changes when workingKey changes,
  // preventing useSyncExternalStore from re-subscribing on every render.
  const subscribeWorking = useCallback(
    (cb: () => void) => subscribeToKey(workingKey, cb),
    [workingKey],
  );

  // Server snapshot → null (consistent with SSR output, no hydration mismatch).
  // Client snapshot → reads from localStorage via stable cache.
  // React re-renders post-hydration if the client value differs from null.
  const storedWorking = useSyncExternalStore(
    subscribeWorking,
    () => readKey(workingKey),
    () => null,
  );

  // All values are derived — no useState needed for storage-backed state.
  const values = storedWorking
    ? { ...factoryDefaults, ...storedWorking }
    : factoryDefaults;

  const isModified = Object.keys(factoryDefaults).some(
    (k) => values[k] !== factoryDefaults[k],
  );

  function handleChange(name: string, value: unknown) {
    if (!version) return;
    writeKey(workingKey, { ...values, [name]: value });
  }

  // Reset: clear working state, restore to factory defaults.
  function handleReset() {
    if (!version) return;
    writeKey(workingKey, null);
  }

  return {
    values,
    factoryDefaults,
    handleChange,
    handleReset,
    isModified,
  };
}
