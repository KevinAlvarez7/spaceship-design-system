'use client';

// Default export required by next/dynamic; named export for direct use.
export function RivePlayer({ src }: { src: string }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded border border-dashed border-zinc-300">
      <span className="px-2 text-center text-[10px] text-zinc-400">
        Install <code>@rive-app/react-canvas</code>
      </span>
    </div>
  );
}

export default RivePlayer;
