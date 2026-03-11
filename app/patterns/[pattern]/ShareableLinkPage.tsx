'use client';

import { useState } from 'react';
import { Preview } from '@/components/viewer/Preview';
import { ShareableLink } from '@/components/patterns';

export function ShareableLinkPage() {
  const [domain, setDomain] = useState('');

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Shareable Link</h1>
        <p className="mt-2 text-sm text-zinc-500">
          An editable input field where users type a domain name, with a fixed suffix and a share button.
          The container expands and contracts with the input content.
        </p>
      </div>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <Preview label="Default">
          <ShareableLink value={domain} onChange={setDomain} />
        </Preview>
      </section>
    </div>
  );
}
