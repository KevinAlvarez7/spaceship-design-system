'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ApprovalCard } from '@spaceship/design-system';
import { Preview } from '@/components/viewer/Preview';

// ─── Markdown content ─────────────────────────────────────────────────────────

const LOW_RISK_MD = `## Implementation Plan

**Relief Teacher Booking System** — Estimated build time: ~15 minutes

### What we're building

A mobile-first, two-sided booking system. Admin staff post relief jobs; available teachers confirm with a single tap. Double-bookings are prevented automatically.

---

### Build sequence

1. **Project setup and routing** (~1 min) — Scaffold the \`Next.js\` app and configure page routing for admin and teacher views.

2. **Admin job posting form** (~3 min) — Build the core form for school admin staff to post a relief job with date, time, school, subject, and notes.

3. **Relief teacher notification view** (~3 min) — Build the notification feed. Pulls open jobs in real time via \`OGP Postman\`.

4. **One-tap accept / decline flow** (~2 min) — Wire up accept and decline actions. First to accept locks the job.

5. **Booking confirmation screen** (~2 min) — Show full job details and contact info to both parties after acceptance.

6. **Double-booking prevention logic** (~2 min) — Database-level constraint via \`Supabase\` row-level locking.

7. **Sample data** (~1 min) — Seed mock teachers, schools, and subjects so the prototype is immediately demoable.

8. **End-to-end QA** (~2 min) — Connect all screens and run through the full booking cycle.

---

### Security overview

**Overall risk: Low**

- No external non-government services connected — all data stays within government infrastructure
- Singpass integration via \`SGID\` — no external auth dependency
- Notifications via \`OGP Postman\` — no data leaves government infrastructure`;

const UNSAFE_MD = `## Implementation Plan

**Payment Gateway Integration** — Estimated build time: ~20 minutes

### What we're building

Integration with an external payment provider — includes webhook handling, card tokenisation, and refund flows. Requires PCI DSS compliance review before any live data is processed.

---

### Build sequence

1. **API contract review** (~3 min) — Read the payment provider's API docs, agree on the integration contract, and set up sandbox credentials.

2. **Webhook endpoint and signature verification** (~3 min) — Build the \`/api/webhook\` handler. Validate the \`HMAC\` signature on every incoming event to prevent replay attacks.

3. **Card tokenisation flow** (~5 min) — Implement the \`PCI DSS\`-scoped tokenisation step using the provider's hosted fields. Card numbers never touch our server.

4. **Refund and dispute handling** (~4 min) — Build refund initiation and dispute response flows. All mutations write to the audit log.

5. **End-to-end test suite with sandbox** (~3 min) — Run the full purchase, refund, and dispute cycle against the sandbox environment.

---

### Security overview

**Overall risk: Unsafe**

- Sends payment data to an external non-government payment provider
- Live payment data — \`PCI DSS\` compliance required before go-live
- Webhook replay attacks must be mitigated with \`HMAC\` signature verification
- Refund logic touches financial records — requires audit logging`;


// ─── Shared markdown classes ──────────────────────────────────────────────────

const MD_CLASSES = [
  'flex flex-col w-full font-(family-name:--font-family-mono)',
  '[&_h2]:[font-size:var(--font-size-base)] [&_h2]:font-bold [&_h2]:text-(--text-primary) [&_h2]:mb-3 [&_h2:first-child]:mt-0',
  '[&_h3]:[font-size:var(--font-size-sm)] [&_h3]:font-semibold [&_h3]:text-(--text-primary) [&_h3]:mt-4 [&_h3]:mb-2',
  '[&_p]:[font-size:var(--font-size-sm)] [&_p]:leading-(--line-height-sm) [&_p]:text-(--text-secondary) [&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ul]:mb-2',
  '[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-2 [&_ol]:mb-2',
  '[&_li]:[font-size:var(--font-size-sm)] [&_li]:text-(--text-secondary)',
  '[&_strong]:font-semibold [&_strong]:text-(--text-primary)',
  '[&_code]:font-mono [&_code]:text-[0.85em] [&_code]:bg-(--bg-surface-secondary) [&_code]:text-(--text-primary) [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded',
  '[&_hr]:my-4 [&_hr]:border-(--border-default)',
  '[&_table]:w-full [&_table]:mb-2 [&_table]:border-collapse',
  '[&_th]:[font-size:var(--font-size-xs)] [&_th]:font-semibold [&_th]:text-(--text-primary) [&_th]:text-left [&_th]:px-2 [&_th]:py-1.5 [&_th]:border-b [&_th]:border-(--border-default)',
  '[&_td]:[font-size:var(--font-size-xs)] [&_td]:text-(--text-secondary) [&_td]:px-2 [&_td]:py-1.5 [&_td]:border-b [&_td]:border-(--border-default)',
].join(' ');

// ─── ApprovalCardDemos ────────────────────────────────────────────────────────

export function ApprovalCardDemos() {
  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Low risk plan</h2>
        <Preview label="overallRisk=&quot;low&quot;" justify="center">
          <div className="w-(--sizing-chat-default)">
            <ApprovalCard
              onApprove={() => {}}
              onReject={() => {}}
              disableMotion
            >
              <div className={MD_CLASSES}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{LOW_RISK_MD}</ReactMarkdown>
              </div>
            </ApprovalCard>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Unsafe plan</h2>
        <Preview label="overallRisk=&quot;unsafe&quot;" justify="center">
          <div className="w-(--sizing-chat-default)">
            <ApprovalCard
              onApprove={() => {}}
              onReject={() => {}}
              disableMotion
            >
              <div className={MD_CLASSES}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{UNSAFE_MD}</ReactMarkdown>
              </div>
            </ApprovalCard>
          </div>
        </Preview>
      </section>
    </>
  );
}
