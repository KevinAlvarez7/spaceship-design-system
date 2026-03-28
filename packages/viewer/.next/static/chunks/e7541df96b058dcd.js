(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,48963,e=>{"use strict";var t=e.i(12009);function a({props:e}){return(0,t.jsx)("div",{className:"overflow-x-auto rounded-lg border border-zinc-200",children:(0,t.jsxs)("table",{className:"w-full text-sm",children:[(0,t.jsx)("thead",{children:(0,t.jsxs)("tr",{className:"border-b border-zinc-200 bg-zinc-50",children:[(0,t.jsx)("th",{className:"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500",children:"Prop"}),(0,t.jsx)("th",{className:"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500",children:"Type"}),(0,t.jsx)("th",{className:"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500",children:"Default"}),(0,t.jsx)("th",{className:"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500",children:"Description"})]})}),(0,t.jsx)("tbody",{className:"divide-y divide-zinc-100",children:e.map(e=>(0,t.jsxs)("tr",{className:"bg-white hover:bg-zinc-50 transition-colors",children:[(0,t.jsx)("td",{className:"px-4 py-3 font-mono text-xs text-zinc-800",children:e.name}),(0,t.jsx)("td",{className:"px-4 py-3 font-mono text-xs text-blue-600",children:e.type}),(0,t.jsx)("td",{className:"px-4 py-3 font-mono text-xs text-zinc-400",children:e.default??"—"}),(0,t.jsx)("td",{className:"px-4 py-3 text-xs text-zinc-600",children:e.description})]},e.name))})]})})}e.s(["PropsTable",()=>a])},86238,e=>{"use strict";var t=e.i(12009),a=e.i(15468);let n=(0,e.i(82193).default)("rotate-cw",[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]]);var o=e.i(18646),i=e.i(44161),r=e.i(5943);let s="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 transition-colors shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]",l="bg-zinc-900 text-white border-zinc-800 text-xs";function c({children:e,className:c,label:u,onOpenInNewTab:d,justify:p="center"}){let[g,m]=(0,a.useState)(0);return(0,t.jsxs)("div",{className:"rounded-lg border border-zinc-200 overflow-hidden",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-3",children:[(0,t.jsx)("span",{className:"text-lg font-bold text-zinc-900",children:u??"Preview"}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsxs)(r.Tooltip,{children:[(0,t.jsx)(r.TooltipTrigger,{asChild:!0,children:(0,t.jsxs)("button",{onClick:()=>m(e=>e+1),className:s,"aria-label":"Refresh preview",children:[(0,t.jsx)(n,{className:"h-4 w-4"}),"Refresh"]})}),(0,t.jsx)(r.TooltipContent,{className:l,children:"Remount component"})]}),d&&(0,t.jsxs)(r.Tooltip,{children:[(0,t.jsx)(r.TooltipTrigger,{asChild:!0,children:(0,t.jsxs)("button",{onClick:d,className:s,"aria-label":"Open in new tab",children:[(0,t.jsx)(o.ExternalLink,{className:"h-4 w-4"}),"Open in new tab"]})}),(0,t.jsx)(r.TooltipContent,{className:l,children:"Open in new tab"})]})]})]}),(0,t.jsx)("div",{className:(0,i.cn)("relative min-h-32 p-8 bg-white","[background-image:radial-gradient(circle,_#d4d4d8_1px,_transparent_1px)]","[background-size:20px_20px]",c),children:(0,t.jsx)("div",{className:(0,i.cn)("flex flex-wrap items-center gap-4 h-full","start"===p?"justify-start":"justify-center"),children:e})},g)]})}e.s(["Preview",()=>c],86238)},41692,92067,e=>{"use strict";var t=e.i(82193);let a=(0,t.default)("moon",[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]]);e.s(["Moon",()=>a],41692);let n=(0,t.default)("sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);e.s(["Sun",()=>n],92067)},77027,e=>{"use strict";var t=e.i(12009),a=e.i(15468),n=e.i(41692),o=e.i(92067),i=e.i(5943);function r({title:e}){let[r,s]=(0,a.useState)("light");return(0,a.useEffect)(()=>{let e=localStorage.getItem("ds-preview-theme");e&&(s(e),document.documentElement.setAttribute("data-theme",e))},[]),(0,t.jsxs)("header",{className:"flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6",children:[(0,t.jsx)("h1",{className:"text-sm font-medium text-zinc-700",children:e}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("span",{className:"text-xs text-zinc-400",children:"Preview theme"}),(0,t.jsxs)(i.Tooltip,{children:[(0,t.jsx)(i.TooltipTrigger,{asChild:!0,children:(0,t.jsx)("button",{onClick:function(){let e="light"===r?"dark":"light";s(e),document.documentElement.setAttribute("data-theme",e),localStorage.setItem("ds-preview-theme",e)},className:"flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors","aria-label":"Toggle DS preview theme",children:"light"===r?(0,t.jsx)(n.Moon,{className:"h-4 w-4"}):(0,t.jsx)(o.Sun,{className:"h-4 w-4"})})}),(0,t.jsx)(i.TooltipContent,{className:"bg-zinc-900 text-white border-zinc-800 text-xs",children:"Toggle preview theme"})]})]})]})}e.s(["Topbar",()=>r])},9744,e=>{"use strict";var t=e.i(12009),a=e.i(97828),n=e.i(99585),o=e.i(76462);e.i(50050);var i=e.i(61915);let r=(0,n.cva)(["inline-flex items-center justify-center whitespace-nowrap","font-sans [font-weight:var(--font-weight-semibold)]","transition-colors duration-(--duration-base) ease-(--ease-in-out)","focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2","focus-visible:ring-(--border-input-focus)","disabled:pointer-events-none disabled:opacity-50","cursor-pointer select-none","rounded-full"],{variants:{variant:{primary:["bg-(--bg-interactive-primary-default) text-(--text-inverse)","hover:bg-(--bg-interactive-primary-hover)","active:bg-(--bg-interactive-primary-pressed)"],ghost:["text-(--text-primary)","hover:bg-(--bg-interactive-secondary-default)"],destructive:["bg-(--bg-interactive-error-default) text-(--text-inverse)","hover:bg-(--bg-interactive-error-hover)"]},size:{sm:["py-2 px-4 gap-1","[font-size:var(--font-size-sm)] leading-(--line-height-sm)"],md:["py-3 px-5 gap-2","[font-size:var(--font-size-sm)] leading-(--line-height-sm)"]},surface:{default:"",shadow:"shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow duration-(--duration-base) ease-(--ease-in-out)"}},defaultVariants:{variant:"primary",size:"sm",surface:"default"}}),s={sm:"[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:2.75]",md:"[&>svg]:h-5 [&>svg]:w-5 [&>svg]:[stroke-width:3]"};function l({icon:e,sizeKey:a}){return e?(0,t.jsx)("span",{className:(0,o.cn)("inline-flex shrink-0 items-center justify-center",s[a]),children:e}):null}function c({className:e,variant:n,size:s,surface:c,disableMotion:u=!1,disabled:d,leadingIcon:p,trailingIcon:g,children:m,...h}){let y=s??"sm",b=(0,o.cn)(r({variant:n,size:s,surface:c}),e),f=(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(l,{icon:p,sizeKey:y}),m,(0,t.jsx)(l,{icon:g,sizeKey:y})]});return u||d?(0,t.jsx)("button",{className:b,disabled:d,...h,children:f}):(0,t.jsx)(a.motion.button,{...h,className:b,style:{...h.style,willChange:"transform"},initial:{scale:1},whileHover:{scale:1.03},whileTap:{scale:.97},transition:i.springs.interactive,children:f})}e.s(["Button",()=>c,"buttonVariants",0,r])},26940,93442,e=>{"use strict";e.i(50050),e.i(16178),e.i(32931);var t=e.i(64959);e.i(9744);var a=e.i(73312),n=e.i(97480),o=e.i(90087),i=e.i(89757);e.i(33847);var r=e.i(23904),s=e.i(86435),l=e.i(83969),c=e.i(180),u=e.i(19901),d=e.i(95300),p=e.i(5866),g=e.i(9847),m=e.i(47409),h=e.i(96863),y=e.i(58340),b=e.i(30798),f=e.i(29995),x=e.i(36544),v=e.i(4548),w=e.i(29888),C=e.i(98121);e.i(32598);var T=e.i(96917),k=e.i(89892),P=e.i(29903),S=e.i(1797),j=e.i(34771),M=e.i(52816),I=e.i(71397),A=e.i(29900),z=e.i(15738),N=e.i(9404);let B=[{name:"Button",slug:"button",component:r.Button,group:"ui",title:"Button",section:"Components",route:"components",layout:"standard",graduatedFrom:{playground:"pg-button",version:"v1"}},{name:"ChatInputBox",slug:"chat-input-box",component:s.ChatInputBox,group:"ui",title:"Chat Input Box",section:"Components",route:"components",layout:"standard"},{name:"ChatBubble",slug:"chat-bubble",component:l.ChatBubble,group:"ui",title:"Chat Bubble",section:"Components",route:"components",layout:"standard"},{name:"ChatMessage",slug:"chat-message",component:c.ChatMessage,group:"ui",title:"Chat Message",section:"Components",route:"components",layout:"standard"},{name:"ChatThread",slug:"chat-thread",component:u.ChatThread,group:"ui",title:"Chat Thread",section:"Components",route:"components",layout:"standard"},{name:"Modal",slug:"modal",component:d.Modal,group:"ui",title:"Modal",section:"Components",route:"components",layout:"standard"},{name:"Tag",slug:"tag",component:p.Tag,group:"ui",title:"Tag",section:"Components",route:"components",layout:"standard"},{name:"ApprovalCard",slug:"approval-card",component:g.ApprovalCard,group:"ui",title:"Approval Card",section:"Components",route:"components",layout:"standard"},{name:"TaskList",slug:"task-list",component:m.TaskList,group:"ui",title:"Task List",section:"Components",route:"components",layout:"standard"},{name:"RadioGroup",slug:"radio-group",component:h.RadioGroup,group:"ui",title:"Radio Group",section:"Components",route:"components",layout:"standard"},{name:"CheckboxGroup",slug:"checkbox-group",component:y.CheckboxGroup,group:"ui",title:"Checkbox Group",section:"Components",route:"components",layout:"standard"},{name:"SortableList",slug:"sortable-list",component:b.SortableList,group:"ui",title:"Sortable List",section:"Components",route:"components",layout:"standard"},{name:"TabBar",slug:"tab-bar",component:f.TabBar,group:"ui",title:"Tab Bar",section:"Components",route:"components",layout:"standard"},{name:"FolderTabs",slug:"folder-tabs",component:x.FolderTabs,group:"ui",title:"Folder Tabs",section:"Components",route:"components",layout:"standard"},{name:"ThinkingDots",slug:"thinking-dots",component:v.ThinkingDots,group:"ui",title:"Thinking Dots",section:"Components",route:"components",layout:"standard"},{name:"Thinking",slug:"thinking",component:v.ThinkingSaucer,group:"ui",title:"Thinking",section:"Components",route:"components",layout:"standard"},{name:"ShimmerText",slug:"shimmer-text",component:w.ShimmerText,group:"ui",title:"Shimmer Text",section:"Components",route:"components",layout:"standard"},{name:"DropdownMenu",slug:"dropdown-menu",component:C.DropdownMenu,group:"ui",title:"Dropdown Menu",section:"Components",route:"components",layout:"standard"},{name:"ChatPanel",slug:"chat-panel",component:P.ChatPanel,group:"patterns",title:"Chat Panel",section:"Patterns",route:"patterns",layout:"bare"},{name:"Chat",slug:"chat",component:P.ChatPanel,group:"patterns",title:"Chat",section:"Patterns",route:"patterns",layout:"standard"},{name:"ChatInputSlot",slug:"chat-input-slot",component:S.ChatInputSlot,group:"patterns",title:"Chat Input Slot",section:"Patterns",route:"patterns",layout:"standard"},{name:"PreviewPanel",slug:"preview-panel",component:j.PreviewPanel,group:"patterns",title:"Preview Panel",section:"Patterns",route:"patterns",layout:"standard"},{name:"PreviewPanelHeader",slug:"preview-panel-header",component:M.PreviewPanelHeader,group:"patterns",title:"Preview Panel Header",section:"Patterns",route:"patterns",layout:"standard"},{name:"EditableTitle",slug:"editable-title",component:I.EditableTitle,group:"patterns",title:"Editable Title",section:"Patterns",route:"patterns",layout:"standard"},{name:"ShareableLink",slug:"shareable-link",component:A.ShareableLink,group:"patterns",title:"Shareable Link",section:"Patterns",route:"patterns",layout:"standard"},{name:"ArtifactSegmentedControl",slug:"artifact-segmented-control",component:z.ArtifactSegmentedControl,group:"patterns",title:"Artifact Panel",section:"Patterns",route:"patterns",layout:"standard"},{name:"ClarificationCard",slug:"clarification-card",component:N.ClarificationCard,group:"patterns",title:"Clarification Card",section:"Patterns",route:"patterns",layout:"standard"},{name:"ButtonV1",slug:"pg-button",component:t.Button,group:"playground",title:"Button",section:"Playground Components",route:"playground",layout:"standard",status:"playground",interactive:!0},{name:"Tag",slug:"pg-tag",component:p.Tag,group:"playground",title:"Tag",section:"Playground Components",route:"playground",layout:"standard",status:"playground",interactive:!0},{name:"ThinkingDots",slug:"pg-thinking-dots",component:v.ThinkingDots,group:"playground",title:"Thinking Dots",section:"Playground Components",route:"playground",layout:"standard",status:"playground",interactive:!0},{name:"GravityWell",slug:"gravity-assist",component:T.GravityWell,group:"playground",title:"Gravity Assist",section:"Playground Effects",route:"playground",layout:"standard",status:"playground"},{name:"GridBackground",slug:"grid-background",component:k.GridBackground,group:"playground",title:"Grid Background",section:"Playground Effects",route:"playground",layout:"standard",status:"playground"},{name:"HomepagePage",slug:"homepage",component:a.HomepagePage,group:"playground",title:"Homepage",section:"Playground Pages",route:"playground",layout:"bare",status:"playground"},{name:"PrototypeWorkspacePage",slug:"prototype-workspace",component:o.PrototypeWorkspacePage,group:"playground",title:"Prototype Workspace",section:"Playground Pages",route:"playground",layout:"bare",status:"playground"},{name:"ArtifactNavigationPage",slug:"artifact-navigation",component:i.ArtifactNavigationPage,group:"playground",title:"Artifact Navigation",section:"Playground Pages",route:"playground",layout:"bare",status:"playground"},{name:"ClarificationChatDemoPage",slug:"clarification-chat",component:n.ClarificationChatDemoPage,group:"playground",title:"Clarification Chat",section:"Playground Pages",route:"playground",layout:"bare",status:"playground"}];e.s(["COMPONENT_REGISTRY",0,B],93442),e.s([],26940)},10793,e=>{"use strict";e.i(16178);var t=e.i(23904),a=e.i(86435),n=e.i(83969),o=e.i(180),i=e.i(19901),r=e.i(95300),s=e.i(5866),l=e.i(9847),c=e.i(47409);e.i(96863),e.i(58340),e.i(30798);var u=e.i(29995),d=e.i(36544),p=e.i(4548);e.i(29888),e.i(3113);var g=e.i(98121);e.i(88619),e.i(71003),e.i(86465),e.i(30952);var m=e.i(27673);e.s(["ThreeBodyPlanets",()=>m.ThreeBodyPlanets],66702),e.i(66702),e.s(["ApprovalCard",()=>l.ApprovalCard,"Button",()=>t.Button,"ChatBubble",()=>n.ChatBubble,"ChatInputBox",()=>a.ChatInputBox,"ChatMessage",()=>o.ChatMessage,"ChatThread",()=>i.ChatThread,"DropdownMenu",()=>g.DropdownMenu,"DropdownMenuContent",()=>g.DropdownMenuContent,"DropdownMenuItem",()=>g.DropdownMenuItem,"DropdownMenuSeparator",()=>g.DropdownMenuSeparator,"DropdownMenuTrigger",()=>g.DropdownMenuTrigger,"FolderTab",()=>d.FolderTab,"FolderTabs",()=>d.FolderTabs,"Modal",()=>r.Modal,"ModalDescription",()=>r.ModalDescription,"ModalFooter",()=>r.ModalFooter,"ModalHeader",()=>r.ModalHeader,"ModalTitle",()=>r.ModalTitle,"TabBar",()=>u.TabBar,"TabBarItem",()=>u.TabBarItem,"Tag",()=>s.Tag,"TaskList",()=>c.TaskList,"Thinking",()=>p.Thinking,"ThinkingDots",()=>p.ThinkingDots],10793)},7907,e=>{"use strict";e.i(32931);var t=e.i(34771),a=e.i(52816),n=e.i(71397),o=e.i(29900),i=e.i(15738);e.i(20445);var r=e.i(29903),s=e.i(1797);e.i(92314),e.i(59113);var l=e.i(42524),c=e.i(9404);e.s(["ArtifactSegmentedControl",()=>i.ArtifactSegmentedControl,"ChatInputSlot",()=>s.ChatInputSlot,"ChatPanel",()=>r.ChatPanel,"ClarificationCard",()=>c.ClarificationCard,"EditableTitle",()=>n.EditableTitle,"PreviewPanel",()=>t.PreviewPanel,"PreviewPanelHeader",()=>a.PreviewPanelHeader,"STAGES",()=>l.STAGES,"ShareableLink",()=>o.ShareableLink,"buildAnswerSummary",()=>l.buildAnswerSummary,"buildClosingMessage",()=>l.buildClosingMessage])},70615,e=>{"use strict";var t=e.i(15468);let a=[{role:"user",content:"I know my problem statement, let's build the prototype!"},{role:"assistant",content:"I'll spin up a low-fi interface with the core screens (Kiosk scan state, Officer exception console, Audit trail) and sample data so you can click through immediately."},{role:"user",content:"Improve the prototype"}],n=`Vibe Prototype Platform Complete!

I've successfully created a playful, inviting prototype platform with all the features you requested:

**What's Built:**
- Interactive Dashboard — project tiles, visual editor, and collaboration features
- Vibe Code Editor — natural language input with real-time preview
- AI Suggestions — playful tooltips and refinement hints
- Collaboration Tools — avatars, sticky notes, and micro-animations

Ready to start vibing with your prototypes! 🎨✨`;function o(){let[e,o]=(0,t.useState)(a),[i,r]=(0,t.useState)(""),[s,l]=(0,t.useState)(""),[c,u]=(0,t.useState)(!0),d=(0,t.useRef)(0);return(0,t.useEffect)(()=>{if(!c)return;let e=setTimeout(()=>{d.current>=n.length?(u(!1),o(e=>[...e,{role:"assistant",content:n}])):(d.current+=4,l(n.slice(0,d.current)))},20);return()=>clearTimeout(e)},[s,c]),{messages:e,streamedText:s,isStreaming:c,inputValue:i,setInputValue:r,handleSubmit:function(e){e.trim()&&(o(t=>[...t,{role:"user",content:e}]),r(""),setTimeout(()=>{o(t=>[...t,{role:"assistant",content:`Got it — I'll work on that now. Give me a moment to process *"${e}"*.`}])},800))},handleStop:function(){u(!1);let e=n.slice(0,d.current);e&&o(t=>[...t,{role:"assistant",content:e}]),l("")}}}e.s(["useChatDemo",()=>o])},69616,e=>{"use strict";let t=[{id:"brief",type:"brief",title:"Project Brief",status:"complete",updatedAt:"2 min ago",content:`## Overview

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
3. Design onboarding around a "describe your idea" prompt, not blank canvas`}];e.s(["MOCK_ARTIFACTS",0,t])}]);