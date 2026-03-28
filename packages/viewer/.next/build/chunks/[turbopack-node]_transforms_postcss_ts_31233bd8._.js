module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/.worktrees/monorepo-restructure/packages/viewer/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/5b2c9_5a92ee43._.js",
  "chunks/[root-of-the-server]__1cd87e9e._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/.worktrees/monorepo-restructure/packages/viewer/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];