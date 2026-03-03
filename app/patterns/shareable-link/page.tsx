'use client';

import { ShareableLink } from '@/components/patterns';

export default function ShareableLinkPage() {
  return (
    <div className="flex flex-col gap-(--spacing-sm) p-(--spacing-sm)">
      <div className="flex items-start">
        <ShareableLink url="spaceship.design/prototype/abc123" />
      </div>
      <div className="flex items-start">
        <ShareableLink url="spaceship.design/prototype/abc123" shareLabel="Share" />
      </div>
    </div>
  );
}
