Add a new DS component named $ARGUMENTS.

Steps:
1. Read .claude/skills/design-system-implementer/design-system-implementer.md
2. Read components/ui/index.ts to understand current barrel exports
3. Create components/ui/$ARGUMENTS.tsx following CVA conventions (array base, surface variant, paren syntax, named export, no default export)
4. Export from components/ui/index.ts
5. Create app/components/[component]/${ARGUMENTS}Page.tsx with Preview, PropsTable, CodeBlock sections
6. Add entry to PAGES map in app/components/[component]/page.tsx
7. Add nav link to components/viewer/Sidebar.tsx under Components
8. Run: npm run build && npm run lint
9. Report what was created and any issues found
