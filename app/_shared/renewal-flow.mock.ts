// ─── Renewal flow prototype mock ──────────────────────────────────────────────
//
// Represents the actual service being validated — a citizen renewal form.
// Officers review this prototype with citizen feedback pinned to specific
// screens and drop-off metrics between steps. The prototype is the fiction
// of the *service*, not of the officer's tool.

export interface RenewalAnnotation {
  id:         string;
  citizen:    string;       // e.g. "Mei Ling"
  context:    string;       // e.g. "Senior, 67, Bedok"
  quote:      string;
  signal:     'supports' | 'contradicts' | 'inconclusive';
  /** Which field the annotation pins to (CSS-style id within the screen). */
  pinTarget?: string;
}

export interface RenewalScreen {
  id:             string;
  step:           number;        // 1-indexed
  title:          string;
  subtitle?:      string;
  /** Citizens entering this step (out of 100 starters). */
  entered:        number;
  /** Citizens completing this step (out of 100 starters). */
  completed:      number;
  /** Avg time on this step in seconds. */
  avgTimeSec:     number;
  /** Whether this screen is the identified failure point. */
  isFailurePoint?: boolean;
  /** The visual mock content for the screen. */
  fields:         RenewalField[];
  /** Citizen quotes pinned to this screen. */
  annotations:    RenewalAnnotation[];
}

export interface RenewalField {
  id:        string;
  kind:      'heading' | 'label-value' | 'dropdown' | 'radio-group' | 'text-input' | 'checkbox' | 'review-summary';
  label:     string;
  value?:    string;
  options?:  string[];
  /** Marks this field as the jargon barrier — highlighted on the prototype. */
  flagged?:  boolean;
  helpText?: string;
}

// ─── The renewal flow screens ─────────────────────────────────────────────────

export const RENEWAL_SCREENS: RenewalScreen[] = [
  {
    id:         'screen-welcome',
    step:       1,
    title:      'Renew your residence document',
    subtitle:   'Takes about 8 minutes. You will need your NRIC, address, and a recent utility bill.',
    entered:    100,
    completed:  73,
    avgTimeSec: 38,
    fields: [
      { id: 'welcome-heading', kind: 'heading',     label: 'Before you start' },
      { id: 'welcome-list',    kind: 'label-value', label: 'What you need',     value: 'NRIC · Address proof · Photo' },
      { id: 'welcome-est',     kind: 'label-value', label: 'Estimated time',    value: '8 minutes' },
    ],
    annotations: [
      {
        id:      'ann-welcome-1',
        citizen: 'Aisyah',
        context: 'Hawker, 45, Toa Payoh',
        quote:   'I had everything ready, started fine.',
        signal:  'contradicts',
      },
    ],
  },
  {
    id:         'screen-residential-status',
    step:       2,
    title:      'Residential status',
    subtitle:   'Required for processing',
    entered:    73,
    completed:  41,
    avgTimeSec: 142,
    isFailurePoint: true,
    fields: [
      { id: 'rs-heading', kind: 'heading', label: 'What is your residential status?' },
      {
        id:      'rs-dropdown',
        kind:    'radio-group',
        label:   'Residential status',
        options: [
          'Permanent resident — primary',
          'Permanent resident — non-primary',
          'Long-term visit pass holder',
          'Other (specify)',
        ],
        flagged: true,
        helpText: 'Select the option that best describes you.',
      },
    ],
    annotations: [
      {
        id:      'ann-rs-1',
        citizen: 'Mei Ling',
        context: 'Parent, 38, Tampines',
        quote:   "I had to Google what 'residential status' meant in this context. I'm a Singaporean — why four options?",
        signal:  'supports',
        pinTarget: 'rs-dropdown',
      },
      {
        id:      'ann-rs-2',
        citizen: 'Rajesh',
        context: 'Senior, 67, Bedok',
        quote:   'I gave up and went down to the service centre. Easier than figuring out which option applied to me.',
        signal:  'supports',
        pinTarget: 'rs-dropdown',
      },
      {
        id:      'ann-rs-3',
        citizen: 'Priya',
        context: 'Caregiver, 52, Jurong East',
        quote:   'I read it three times to be sure I picked the right option.',
        signal:  'supports',
        pinTarget: 'rs-dropdown',
      },
    ],
  },
  {
    id:         'screen-personal-info',
    step:       3,
    title:      'Confirm your details',
    subtitle:   'Make sure these match your NRIC',
    entered:    41,
    completed:  35,
    avgTimeSec: 78,
    fields: [
      { id: 'pi-heading',  kind: 'heading',     label: 'Personal details' },
      { id: 'pi-name',     kind: 'label-value', label: 'Full name',     value: 'TAN MEI LING' },
      { id: 'pi-nric',     kind: 'label-value', label: 'NRIC',          value: 'S••••••5J' },
      { id: 'pi-address',  kind: 'text-input',  label: 'Current address', value: '' },
      { id: 'pi-phone',    kind: 'text-input',  label: 'Mobile number',   value: '' },
    ],
    annotations: [
      {
        id:      'ann-pi-1',
        citizen: 'Daniel',
        context: 'Renter, 29, Yishun',
        quote:   "Why ask the address again — didn't I just confirm my residence status?",
        signal:  'inconclusive',
        pinTarget: 'pi-address',
      },
    ],
  },
  {
    id:         'screen-confirm',
    step:       4,
    title:      'Review & submit',
    subtitle:   'Confirm what you are submitting',
    entered:    35,
    completed:  28,
    avgTimeSec: 64,
    fields: [
      { id: 'cf-heading',  kind: 'heading',         label: 'Ready to submit?' },
      { id: 'cf-summary',  kind: 'review-summary',  label: 'Renewal type', value: 'Standard · 5-year' },
      { id: 'cf-fee',      kind: 'label-value',     label: 'Fee',          value: 'S$80.00' },
      { id: 'cf-agree',    kind: 'checkbox',        label: 'I confirm the details above are correct' },
    ],
    annotations: [
      {
        id:      'ann-cf-1',
        citizen: 'Daniel',
        context: 'Renter, 29, Yishun',
        quote:   'I reached the last screen and didn\'t know if it went through. Had to call.',
        signal:  'supports',
        pinTarget: 'cf-agree',
      },
    ],
  },
];

// ─── Dashboard metrics ────────────────────────────────────────────────────────

export interface DashboardMetric {
  label:      string;
  value:      string;
  delta?:     string;             // e.g. "↓ 12 pts vs benchmark"
  tone?:      'positive' | 'negative' | 'neutral';
  helpText?:  string;
}

export const DASHBOARD_METRICS: DashboardMetric[] = [
  {
    label:    'Completion rate',
    value:    '28%',
    delta:    '↓ 32 pts vs benchmark',
    tone:     'negative',
    helpText: '47 of 168 starts',
  },
  {
    label:    'Drop-off concentrated at',
    value:    'Step 2',
    delta:    'Residential status',
    tone:     'negative',
  },
  {
    label:    'Sample size',
    value:    '47',
    delta:    'citizens · last 14 days',
    tone:     'neutral',
  },
  {
    label:    'Avg. time-on-task',
    value:    '8m 42s',
    delta:    '↑ 3m above target',
    tone:     'negative',
  },
];

export interface DashboardIssue {
  id:        string;
  label:     string;
  flagged:   number;             // count of citizens who reported it
  step:      string;             // e.g. "Step 2"
}

export const DASHBOARD_ISSUES: DashboardIssue[] = [
  { id: 'iss-1', label: 'Jargon on the residential-status options',  flagged: 6, step: 'Step 2' },
  { id: 'iss-2', label: 'No way to go back without losing answers',  flagged: 4, step: 'Step 2' },
  { id: 'iss-3', label: 'Unclear if submission went through',        flagged: 3, step: 'Step 4' },
  { id: 'iss-4', label: 'Redundant address entry',                   flagged: 2, step: 'Step 3' },
];

export interface DashboardSignalBreakdown {
  supports:     number;
  contradicts:  number;
  inconclusive: number;
}

export const DASHBOARD_SIGNAL_BREAKDOWN: DashboardSignalBreakdown = {
  supports:     6,
  contradicts:  1,
  inconclusive: 1,
};
