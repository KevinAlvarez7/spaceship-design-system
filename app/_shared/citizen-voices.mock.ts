// ─── Shared citizen voices ────────────────────────────────────────────────────
//
// Fictional citizen quotes, survey responses, and interview snippets shared
// across all four validation prototypes (HypothesisLab, EvidenceStudio,
// ReadinessGate, ValidationStudio). Keeping a single source of truth means the
// same citizens recur across flows so reviewers see the through-line.

export interface CitizenQuote {
  id:        string;
  name:      string;
  context:   string;       // e.g. "Parent, 38, Tampines" or "Hawker, 62, Bedok"
  quote:     string;
  signal:    'supports' | 'contradicts' | 'inconclusive';
  topic:     string;       // short tag like "Wait time" or "Form confusion"
}

export interface CitizenSurveyResponse {
  id:           string;
  name:         string;
  context:      string;
  rating:       1 | 2 | 3 | 4 | 5;
  selectedTags: string[];
  freeText?:    string;
}

export interface CitizenImpactPersona {
  id:               string;
  name:             string;
  context:          string;
  predictedImpact:  string;
  confidence:       'high' | 'medium' | 'low';
}

// ─── Submission quotes — early evidence from a "share your experience" form ──

export const SUBMISSION_QUOTES: CitizenQuote[] = [
  {
    id:      'sub-1',
    name:    'Mei Ling',
    context: 'Parent, 38, Tampines',
    quote:   "I tried to apply three times last month. Each time the form asked for documents I didn't have on me, so I had to start over.",
    signal:  'supports',
    topic:   'Form abandonment',
  },
  {
    id:      'sub-2',
    name:    'Rajesh',
    context: 'Senior, 67, Bedok',
    quote:   "I gave up and just went down to the service centre. Easier than figuring out which option applied to me.",
    signal:  'supports',
    topic:   'Confusing options',
  },
  {
    id:      'sub-3',
    name:    'Aisyah',
    context: 'Hawker, 45, Toa Payoh',
    quote:   "Honestly, the system works fine for me. I do it once a year, takes maybe ten minutes.",
    signal:  'contradicts',
    topic:   'Works as expected',
  },
];

// ─── Survey responses — mid-flow evidence ────────────────────────────────────

export const SURVEY_RESPONSES: CitizenSurveyResponse[] = [
  {
    id:           'srv-1',
    name:         'Mei Ling',
    context:      'Parent, 38, Tampines',
    rating:       2,
    selectedTags: ['Took too long', 'Confusing'],
    freeText:     "I'm comfortable with apps but this one felt like it was written for someone who already knew the answer.",
  },
  {
    id:           'srv-2',
    name:         'Rajesh',
    context:      'Senior, 67, Bedok',
    rating:       1,
    selectedTags: ['Confusing', 'Needed help', 'Gave up'],
    freeText:     "My daughter had to help me. I am ok with technology but this one was difficult.",
  },
  {
    id:           'srv-3',
    name:         'Aisyah',
    context:      'Hawker, 45, Toa Payoh',
    rating:       4,
    selectedTags: ['Worked fine'],
  },
  {
    id:           'srv-4',
    name:         'Daniel',
    context:      'Renter, 29, Yishun',
    rating:       2,
    selectedTags: ['Took too long', 'Unclear what to do next'],
    freeText:     "Reached the last screen and didn't know if it went through. Had to call to confirm.",
  },
  {
    id:           'srv-5',
    name:         'Priya',
    context:      'Caregiver, 52, Jurong East',
    rating:       3,
    selectedTags: ['Confusing'],
    freeText:     "It works but I had to read every screen twice to be sure I picked the right option.",
  },
];

// ─── Interview snippets — qualitative evidence ───────────────────────────────

export const INTERVIEW_SNIPPETS: CitizenQuote[] = [
  {
    id:      'int-1',
    name:    'Mei Ling',
    context: 'Parent, 38, Tampines',
    quote:   "When it said 'select your residential status' I had to Google what that meant in this context. I'm a Singaporean. Why are there four options?",
    signal:  'supports',
    topic:   'Jargon barrier',
  },
  {
    id:      'int-2',
    name:    'Rajesh',
    context: 'Senior, 67, Bedok',
    quote:   "The buttons are too small for me. And when I made a mistake on page two, I had to start from the beginning.",
    signal:  'supports',
    topic:   'No back navigation',
  },
  {
    id:      'int-3',
    name:    'Daniel',
    context: 'Renter, 29, Yishun',
    quote:   "I'd rather have a single page with everything than a wizard. The wizard hides what's coming.",
    signal:  'inconclusive',
    topic:   'Wizard vs single-page',
  },
];

// ─── Impact personas — pre-launch predicted impact preview ───────────────────

export const IMPACT_PERSONAS: CitizenImpactPersona[] = [
  {
    id:              'imp-1',
    name:            'Mei Ling',
    context:         'Parent, 38, Tampines',
    predictedImpact: 'Likely to complete on first try',
    confidence:      'high',
  },
  {
    id:              'imp-2',
    name:            'Rajesh',
    context:         'Senior, 67, Bedok',
    predictedImpact: 'Still needs assistance from family',
    confidence:      'medium',
  },
  {
    id:              'imp-3',
    name:            'Aisyah',
    context:         'Hawker, 45, Toa Payoh',
    predictedImpact: 'No change — already worked for her',
    confidence:      'high',
  },
  {
    id:              'imp-4',
    name:            'Daniel',
    context:         'Renter, 29, Yishun',
    predictedImpact: 'Confirmation step resolves his confusion',
    confidence:      'high',
  },
  {
    id:              'imp-5',
    name:            'Priya',
    context:         'Caregiver, 52, Jurong East',
    predictedImpact: 'Mild improvement; jargon still a barrier',
    confidence:      'low',
  },
];

// ─── Survey question scaffold (used by CitizenSurveyScene) ───────────────────

export const SURVEY_TAGS = [
  'Took too long',
  'Confusing',
  'Needed help',
  'Unclear what to do next',
  'Gave up',
  'Worked fine',
] as const;

export const SURVEY_FREETEXT_PROMPT =
  'In your own words, what was the hardest part?';
