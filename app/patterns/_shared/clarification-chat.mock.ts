import type { Artifact } from './artifactData';
import type { ClarificationQuestion } from '@/components/ui';

// ─── User message ─────────────────────────────────────────────────────────────

export const USER_MESSAGE =
  `I want to build an interactive HDB resale price explorer for Singapore. Users should be able to filter by town, flat type, and year range, and see average prices on a map. Can you help me scope and build it?`;

// ─── Assistant messages ───────────────────────────────────────────────────────

export const ASSISTANT_INTRO =
  `Got it — before I start building, I have a few questions to make sure we design exactly the right thing.`;

export const ASSISTANT_AFTER_STEP_1 =
  `Perfect. Based on your answers, here's the blueprint — a PRD capturing the core requirements.`;

export const ASSISTANT_AFTER_STEP_2 =
  `Great. Here's how I'll build it — a concrete task-by-task implementation plan.`;

export const ASSISTANT_AFTER_STEP_3 =
  `Starting implementation now...`;

// ─── Step 1 — Requirements (4 questions) ─────────────────────────────────────

export const STEP_1_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Who is the primary audience?',
    options: ['First-time homebuyers', 'Property investors', 'Researchers & analysts', 'General public'],
  },
  {
    type: 'single',
    label: 'Which map provider should we use?',
    options: ['OneMap (Singapore)', 'Google Maps', 'Mapbox', 'Leaflet (OpenStreetMap)'],
  },
  {
    type: 'multi',
    label: 'Which filters should users be able to apply?',
    options: ['Town / estate', 'Flat type (2-room, 3-room…)', 'Year range', 'Storey range', 'Remaining lease'],
  },
  {
    type: 'multi',
    label: 'Which visualizations should the explorer include?',
    options: ['Choropleth map by town', 'Price trend line chart', 'Distribution histogram', 'Comparison table'],
  },
];

// ─── Step 2 — Review plan ─────────────────────────────────────────────────────

export const STEP_2_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Ready to review the implementation plan?',
    options: ['Yes, show me the plan', 'Let me refine requirements first', 'Skip ahead and start building'],
  },
];

// ─── Step 3 — Confirm build ───────────────────────────────────────────────────

export const STEP_3_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Looks good — shall I start building?',
    options: ['Yes, start building', 'Make a small change first', 'Generate tests first'],
  },
];

// ─── PRD artifact ─────────────────────────────────────────────────────────────

export const PRD_ARTIFACT: Artifact = {
  id: 'prd',
  type: 'prd',
  title: 'HDB Resale Price Explorer',
  status: 'draft',
  updatedAt: 'just now',
  content: `## App Title

HDB Resale Price Explorer

## Summary

An interactive data visualization tool for exploring Singapore HDB resale flat prices by town, flat type, and year range — built for first-time homebuyers and researchers who want intuitive, map-driven price discovery.

## User Personas

Primary — First-time homebuyers researching affordability across estates
Secondary — Property investors comparing price trends by flat type and year

## User Stories

1. As a homebuyer, I want to see average resale prices on a map by town
2. As an investor, I want to filter by flat type and year range to spot trends
3. As a researcher, I want to export filtered data for further analysis

## Technical Approach

- Data: data.gov.sg Resale Flat Prices API (public, no auth required)
- Map: OneMap Singapore (official government tile provider)
- Frontend: Next.js + Tailwind + Recharts for charts
- No backend required — all data fetched client-side

## Third-Party APIs

| Service | Purpose | Auth |
|---------|---------|------|
| data.gov.sg | Resale price dataset | None |
| OneMap API | Map tiles and geocoding | Free token |
| Recharts | Chart components | NPM |`,
};

// ─── Implementation plan artifact ─────────────────────────────────────────────

export const IMPLEMENTATION_PLAN_ARTIFACT: Artifact = {
  id: 'implementation',
  type: 'implementation',
  title: 'Implementation Plan',
  status: 'in-progress',
  updatedAt: 'just now',
  content: `## Architecture

### Frontend Stack
- Next.js 15 with App Router and TypeScript
- Tailwind CSS v4 for styling
- react-leaflet 4.x for map rendering
- Recharts 2.x for chart components

### Data Pipeline
- Client-side fetch from data.gov.sg public API
- JSON response cached in sessionStorage (24hr TTL)
- Aggregation computed client-side (average price per town × flat type × year)

### State Management
- React useState + useReducer for filter state
- URL search params for shareable filter state (next/navigation)
- No external state library needed at this scale

## Component Hierarchy

### MapExplorer (root page component)
- FilterPanel (left sidebar)
  - TownSelect (multi-select dropdown)
  - FlatTypeSelect (radio group: 2-room through Executive)
  - YearRangeSlider (dual-handle range, 1990–2024)
- MapView (center, full-height)
  - ChoroplethLayer (GeoJSON overlay, color-scaled by avg price)
  - TownTooltip (hover popup: town name, avg price, transaction count)
  - MapLegend (color scale legend, bottom-left)
- ChartPanel (collapsible bottom drawer)
  - PriceTrendChart (line chart, one series per selected town)
  - DistributionHistogram (bar chart, price buckets for selected filters)

## API Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| api.data.gov.sg/v1/public/api/action/datastore_search | GET | Filtered resale records |
| www.onemap.gov.sg/api/auth/post/getToken | POST | OneMap auth token |
| www.onemap.gov.sg/api/common/elastic/search | GET | Geocode town centroids |
| raw.githubusercontent.com/…/sg-hdb-towns.geojson | GET | Town boundary GeoJSON |

### Data Shaping
- Raw records: { town, flat_type, storey_range, floor_area_sqm, resale_price, month }
- Aggregate: group by town + flat_type + year → compute mean resale_price
- GeoJSON join: match town name → attach aggregated price to feature properties

## Milestones

1. Sprint 1 — Data layer: API client, caching, aggregation utilities
2. Sprint 2 — Map foundation: react-leaflet setup, GeoJSON boundaries, choropleth layer
3. Sprint 3 — Filter panel: town/flat-type/year selectors wired to map
4. Sprint 4 — Charts: price trend line chart + distribution histogram
5. Sprint 5 — Polish: loading skeletons, error states, mobile layout, URL sharing`,
};

// ─── Preview artifact ─────────────────────────────────────────────────────────

export const PREVIEW_ARTIFACT: Artifact = {
  id: 'preview',
  type: 'preview',
  title: 'Live Preview',
  status: 'complete',
  updatedAt: 'just now',
  content: '',
};

// ─── Implementation tasks (for live progress) ─────────────────────────────────

export const IMPLEMENTATION_TASKS = [
  'Set up Next.js project with Tailwind CSS v4',
  'Integrate OneMap tile layer with react-leaflet',
  'Fetch and parse data.gov.sg resale flat prices API',
  'Build town-level choropleth map layer',
  'Implement filter panel (town, flat type, year range)',
  'Add Recharts price trend line chart',
  'Add distribution histogram for price ranges',
  'Polish UI, loading states, and mobile layout',
];
