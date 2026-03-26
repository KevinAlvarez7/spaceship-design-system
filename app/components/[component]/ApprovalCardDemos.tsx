'use client';

import { ApprovalCard } from '@/components/ui';
import type { ApprovalPlan } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';

const PLAN_LOW_RISK: ApprovalPlan = {
  title: 'Relief Teacher Booking System',
  totalEstimate: '4 weeks',
  steps: [
    { title: 'Project setup and routing',                 timeEstimate: '1 day',  riskLevel: 'safe' },
    { title: 'Admin job posting form',                    timeEstimate: '3 days', riskLevel: 'safe' },
    { title: 'Relief teacher notification view',          timeEstimate: '3 days', riskLevel: 'low'  },
    { title: 'One-tap accept / decline flow',             timeEstimate: '2 days', riskLevel: 'safe' },
    { title: 'Booking confirmation screen',               timeEstimate: '2 days', riskLevel: 'safe' },
    { title: 'Double-booking prevention logic',           timeEstimate: '2 days', riskLevel: 'low'  },
    { title: 'Sample data — teachers, schools, subjects', timeEstimate: '1 day',  riskLevel: 'safe' },
    { title: 'End-to-end flow integration and QA',        timeEstimate: '2 days', riskLevel: 'low'  },
  ],
  riskSummary: {
    overallRisk: 'low',
    notes: [
      'No external services connected — all data is mock',
      'Prototype handles information up to Restricted / Sensitive Normal',
      'Singpass integration deferred to POC phase',
    ],
  },
};

const PLAN_HIGH_RISK: ApprovalPlan = {
  title: 'Payment Gateway Integration',
  totalEstimate: '6 weeks',
  steps: [
    { title: 'API contract review with payment provider',   timeEstimate: '3 days', riskLevel: 'low'    },
    { title: 'Webhook endpoint and signature verification', timeEstimate: '3 days', riskLevel: 'medium' },
    { title: 'Card tokenisation flow (PCI DSS scope)',      timeEstimate: '1 week', riskLevel: 'high'   },
    { title: 'Refund and dispute handling',                 timeEstimate: '4 days', riskLevel: 'high'   },
    { title: 'End-to-end test suite with sandbox',          timeEstimate: '3 days', riskLevel: 'medium' },
  ],
  riskSummary: {
    overallRisk: 'high',
    notes: [
      'Live payment data — PCI DSS compliance required',
      'Webhook replay attacks must be mitigated with signature verification',
      'Refund logic touches financial records — requires audit logging',
    ],
  },
};

export function ApprovalCardDemos() {
  return (
    <>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Low risk plan</h2>
        <Preview label="overallRisk=&quot;low&quot;" justify="center">
          <div className="w-(--sizing-chat-default)">
            <ApprovalCard
              plan={PLAN_LOW_RISK}
              onApprove={() => {}}
              onReject={() => {}}
              disableMotion
            />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">High risk plan</h2>
        <Preview label="overallRisk=&quot;high&quot;" justify="center">
          <div className="w-(--sizing-chat-default)">
            <ApprovalCard
              plan={PLAN_HIGH_RISK}
              onApprove={() => {}}
              onReject={() => {}}
              disableMotion
            />
          </div>
        </Preview>
      </section>
    </>
  );
}
