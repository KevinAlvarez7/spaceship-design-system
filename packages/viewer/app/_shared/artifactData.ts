import type { Artifact } from '@spaceship/design-system';

export const MOCK_ARTIFACTS: Artifact[] = [
  {
    id: 'brief',
    type: 'brief',
    title: 'Project Brief',
    status: 'complete',
    updatedAt: '2 min ago',
    content: `## Overview

Build an AI-powered vibe-coding tool that generates full-stack web applications from natural language prompts. The tool continuously updates multiple artifact types as the user iterates.

## Goals

- Enable non-technical users to create production-ready apps
- Reduce time-to-prototype from days to minutes
- Support live iteration via a chat interface

## User Stories

1. As a founder, I want to describe my app idea and see a working prototype instantly
2. As a designer, I want to tweak UI details through natural language without writing code
3. As a developer, I want to see the generated code and override specific parts

## Success Metrics

- Time to first prototype: < 2 minutes
- User satisfaction score: > 4.5 / 5
- Iteration cycle time: < 30 seconds per change`,
  },
  {
    id: 'security',
    type: 'security',
    title: 'Security Review',
    status: 'in-progress',
    updatedAt: '5 min ago',
    content: `## Security Review

### Threat Model

Identify and mitigate key attack vectors for an AI-powered code generation platform.

### Key Risks

#### Code Injection
- Generated code may contain malicious patterns
- Mitigation: static analysis pass before execution; sandboxed preview iframe

#### Prompt Injection
- Malicious user input could hijack the AI pipeline
- Mitigation: input sanitisation layer; system prompt hardening

#### Data Exfiltration
- Generated apps could leak session tokens or user data
- Mitigation: Content Security Policy on preview iframe; no external network in sandbox

### Authentication & Authorisation

- JWT-based session tokens with 1h expiry
- Row-level security on all user artifacts in Postgres
- API rate limiting: 60 req/min per user

### Compliance

- GDPR: user data deletion within 30 days of request
- SOC 2 Type II audit scheduled for Q3`,
  },
  {
    id: 'prototype',
    type: 'prototype',
    title: 'Prototype',
    status: 'in-progress',
    updatedAt: '8 min ago',
    content: `## Prototype Plan

### Goals

Validate core interaction model before full build — specifically the chat-driven iteration loop and multi-artifact panel layout.

### Scope

**In scope**
- Chat input → streaming artifact updates
- Tab switcher between artifact types
- Basic live preview iframe

**Out of scope**
- Authentication, persistence, sharing
- Code export / download

### Tools

- Next.js App Router (scaffold only)
- Tailwind CSS v4 + Spaceship DS
- Claude claude-sonnet-4-6 via direct API (no tRPC yet)

### Timeline

| Day | Milestone |
|-----|-----------|
| 1   | Chat UI + streaming text response |
| 2   | Multi-artifact panel + tab switcher |
| 3   | Live preview iframe (sandboxed) |
| 4   | Internal review + iteration |

### Success Criteria

- Can generate a simple to-do app end-to-end in < 2 min
- Tab switching feels immediate and stable
- Preview renders without security warnings`,
  },
  {
    id: 'research',
    type: 'research',
    title: 'User Research',
    status: 'draft',
    updatedAt: '12 min ago',
    content: `## User Research

### Research Questions

1. How do non-technical founders currently prototype app ideas?
2. What are the biggest friction points in early-stage product development?
3. How much do users trust AI-generated code without review?

### Methodology

**Interviews (n=12)**
- Founders with no engineering background
- 30-minute semi-structured sessions
- Screened for: have tried to build a product in the last 12 months

**Usability Sessions (n=8)**
- Think-aloud protocol on prototype build
- Tasks: describe an app idea, iterate via chat, share with a collaborator

### Key Findings

#### Pain Points
- Current tools require either code knowledge or rigid templates
- Iteration cycles with contractors take days — users want instant feedback
- Fear of "black box" output: users want to understand what was generated

#### Opportunities
- Show confidence scores or explanations alongside generated artifacts
- Allow partial overrides — users want control without full ownership
- Slack/email sharing as a first-class action to get stakeholder buy-in fast

### Recommendations

1. Add an "explain this" action on every artifact type
2. Surface a one-click share flow on prototype and code tabs
3. Design onboarding around a "describe your idea" prompt, not blank canvas`,
  },
];
