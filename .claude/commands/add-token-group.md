Add a new token group for $ARGUMENTS.

Steps:
1. Read docs/conventions.md — specifically the token naming section and group naming rules
2. Read styles/tokens.css to understand the current token structure
3. Add CSS variables to styles/tokens.css (semantic → primitive chain)
4. Add group entry to the appropriate tokens/*.ts file following the " / " naming convention
5. Export from tokens/index.ts if a new file was created
6. Run: npm run build
7. Open browser to the relevant token page and confirm it renders at the correct nesting level
8. Report what was added
