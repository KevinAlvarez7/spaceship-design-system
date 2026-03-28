module.exports=[72506,a=>{"use strict";var b=a.i(76621);function c({props:a}){return(0,b.jsx)("div",{className:"overflow-x-auto rounded-lg border border-zinc-200",children:(0,b.jsxs)("table",{className:"w-full text-sm",children:[(0,b.jsx)("thead",{children:(0,b.jsxs)("tr",{className:"border-b border-zinc-200 bg-zinc-50",children:[(0,b.jsx)("th",{className:"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500",children:"Prop"}),(0,b.jsx)("th",{className:"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500",children:"Type"}),(0,b.jsx)("th",{className:"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500",children:"Default"}),(0,b.jsx)("th",{className:"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500",children:"Description"})]})}),(0,b.jsx)("tbody",{className:"divide-y divide-zinc-100",children:a.map(a=>(0,b.jsxs)("tr",{className:"bg-white hover:bg-zinc-50 transition-colors",children:[(0,b.jsx)("td",{className:"px-4 py-3 font-mono text-xs text-zinc-800",children:a.name}),(0,b.jsx)("td",{className:"px-4 py-3 font-mono text-xs text-blue-600",children:a.type}),(0,b.jsx)("td",{className:"px-4 py-3 font-mono text-xs text-zinc-400",children:a.default??"—"}),(0,b.jsx)("td",{className:"px-4 py-3 text-xs text-zinc-600",children:a.description})]},a.name))})]})})}a.s(["PropsTable",()=>c])},96009,a=>{"use strict";a.i(51303);var b=a.i(62568),c=a.i(56897),d=a.i(35478),e=a.i(66408),f=a.i(7825),g=a.i(27079),h=a.i(16488),i=a.i(51647),j=a.i(91678);a.i(23001),a.i(89106),a.i(21095);var k=a.i(91048),l=a.i(88164),m=a.i(1415);a.i(10869),a.i(30623);var n=a.i(94965);a.i(75097),a.i(7134),a.i(18896),a.i(14886);var o=a.i(37309);a.s(["ThreeBodyPlanets",()=>o.ThreeBodyPlanets],97758),a.i(97758),a.s(["ApprovalCard",()=>i.ApprovalCard,"Button",()=>b.Button,"ChatBubble",()=>d.ChatBubble,"ChatInputBox",()=>c.ChatInputBox,"ChatMessage",()=>e.ChatMessage,"ChatThread",()=>f.ChatThread,"DropdownMenu",()=>n.DropdownMenu,"DropdownMenuContent",()=>n.DropdownMenuContent,"DropdownMenuItem",()=>n.DropdownMenuItem,"DropdownMenuSeparator",()=>n.DropdownMenuSeparator,"DropdownMenuTrigger",()=>n.DropdownMenuTrigger,"FolderTab",()=>l.FolderTab,"FolderTabs",()=>l.FolderTabs,"Modal",()=>g.Modal,"ModalDescription",()=>g.ModalDescription,"ModalFooter",()=>g.ModalFooter,"ModalHeader",()=>g.ModalHeader,"ModalTitle",()=>g.ModalTitle,"TabBar",()=>k.TabBar,"TabBarItem",()=>k.TabBarItem,"Tag",()=>h.Tag,"TaskList",()=>j.TaskList,"Thinking",()=>m.Thinking,"ThinkingDots",()=>m.ThinkingDots],96009)},13666,a=>{"use strict";var b=a.i(76621),c=a.i(41598);let d=(0,a.i(71286).default)("rotate-cw",[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]]);var e=a.i(53810),f=a.i(48143),g=a.i(9779);let h="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 transition-colors shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]",i="bg-zinc-900 text-white border-zinc-800 text-xs";function j({children:a,className:j,label:k,onOpenInNewTab:l,justify:m="center"}){let[n,o]=(0,c.useState)(0);return(0,b.jsxs)("div",{className:"rounded-lg border border-zinc-200 overflow-hidden",children:[(0,b.jsxs)("div",{className:"flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-3",children:[(0,b.jsx)("span",{className:"text-lg font-bold text-zinc-900",children:k??"Preview"}),(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsxs)(g.Tooltip,{children:[(0,b.jsx)(g.TooltipTrigger,{asChild:!0,children:(0,b.jsxs)("button",{onClick:()=>o(a=>a+1),className:h,"aria-label":"Refresh preview",children:[(0,b.jsx)(d,{className:"h-4 w-4"}),"Refresh"]})}),(0,b.jsx)(g.TooltipContent,{className:i,children:"Remount component"})]}),l&&(0,b.jsxs)(g.Tooltip,{children:[(0,b.jsx)(g.TooltipTrigger,{asChild:!0,children:(0,b.jsxs)("button",{onClick:l,className:h,"aria-label":"Open in new tab",children:[(0,b.jsx)(e.ExternalLink,{className:"h-4 w-4"}),"Open in new tab"]})}),(0,b.jsx)(g.TooltipContent,{className:i,children:"Open in new tab"})]})]})]}),(0,b.jsx)("div",{className:(0,f.cn)("relative min-h-32 p-8 bg-white","[background-image:radial-gradient(circle,_#d4d4d8_1px,_transparent_1px)]","[background-size:20px_20px]",j),children:(0,b.jsx)("div",{className:(0,f.cn)("flex flex-wrap items-center gap-4 h-full","start"===m?"justify-start":"justify-center"),children:a})},n)]})}a.s(["Preview",()=>j],13666)},95678,a=>{"use strict";a.i(38810);var b=a.i(62086),c=a.i(6276),d=a.i(79899),e=a.i(38992),f=a.i(61816);a.i(81678);var g=a.i(45856),h=a.i(42176);a.i(79426),a.i(80823);var i=a.i(53897),j=a.i(73559);a.s(["ArtifactSegmentedControl",()=>f.ArtifactSegmentedControl,"ChatInputSlot",()=>h.ChatInputSlot,"ChatPanel",()=>g.ChatPanel,"ClarificationCard",()=>j.ClarificationCard,"EditableTitle",()=>d.EditableTitle,"PreviewPanel",()=>b.PreviewPanel,"PreviewPanelHeader",()=>c.PreviewPanelHeader,"STAGES",()=>i.STAGES,"ShareableLink",()=>e.ShareableLink,"buildAnswerSummary",()=>i.buildAnswerSummary,"buildClosingMessage",()=>i.buildClosingMessage])},21987,a=>{"use strict";var b=a.i(41598);let c=[{role:"user",content:"I know my problem statement, let's build the prototype!"},{role:"assistant",content:"I'll spin up a low-fi interface with the core screens (Kiosk scan state, Officer exception console, Audit trail) and sample data so you can click through immediately."},{role:"user",content:"Improve the prototype"}],d=`Vibe Prototype Platform Complete!

I've successfully created a playful, inviting prototype platform with all the features you requested:

**What's Built:**
- Interactive Dashboard — project tiles, visual editor, and collaboration features
- Vibe Code Editor — natural language input with real-time preview
- AI Suggestions — playful tooltips and refinement hints
- Collaboration Tools — avatars, sticky notes, and micro-animations

Ready to start vibing with your prototypes! 🎨✨`;function e(){let[a,e]=(0,b.useState)(c),[f,g]=(0,b.useState)(""),[h,i]=(0,b.useState)(""),[j,k]=(0,b.useState)(!0),l=(0,b.useRef)(0);return(0,b.useEffect)(()=>{if(!j)return;let a=setTimeout(()=>{l.current>=d.length?(k(!1),e(a=>[...a,{role:"assistant",content:d}])):(l.current+=4,i(d.slice(0,l.current)))},20);return()=>clearTimeout(a)},[h,j]),{messages:a,streamedText:h,isStreaming:j,inputValue:f,setInputValue:g,handleSubmit:function(a){a.trim()&&(e(b=>[...b,{role:"user",content:a}]),g(""),setTimeout(()=>{e(b=>[...b,{role:"assistant",content:`Got it — I'll work on that now. Give me a moment to process *"${a}"*.`}])},800))},handleStop:function(){k(!1);let a=d.slice(0,l.current);a&&e(b=>[...b,{role:"assistant",content:a}]),i("")}}}a.s(["useChatDemo",()=>e])},27075,a=>{"use strict";let b=[{id:"brief",type:"brief",title:"Project Brief",status:"complete",updatedAt:"2 min ago",content:`## Overview

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
- Iteration cycle time: < 30 seconds per change`},{id:"security",type:"security",title:"Security Review",status:"in-progress",updatedAt:"5 min ago",content:`## Security Review

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
- SOC 2 Type II audit scheduled for Q3`},{id:"prototype",type:"prototype",title:"Prototype",status:"in-progress",updatedAt:"8 min ago",content:`## Prototype Plan

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
- Preview renders without security warnings`},{id:"research",type:"research",title:"User Research",status:"draft",updatedAt:"12 min ago",content:`## User Research

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
3. Design onboarding around a "describe your idea" prompt, not blank canvas`}];a.s(["MOCK_ARTIFACTS",0,b])}];

//# sourceMappingURL=_worktrees_monorepo-restructure_packages_ab22b107._.js.map