Sync tokens from a Figma export.

Steps:
1. Read CLAUDE.md — specifically the Figma Workflow section
2. Read .claude/skills/figma-to-code/figma-to-code.md
3. Use Figma MCP get_variable_defs to pull variable definitions for $ARGUMENTS
4. Export to /tmp/figma_vars.json
5. Run: node scripts/generate-tokens.mjs
6. Review the diff in tokens/colors.ts
7. Update styles/tokens.css to wire any new semantic tokens to primitives
8. Run: npm run build
9. Report what changed
