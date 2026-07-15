# Peer Review of Founding Docs — 2026-07-15 (condensed record)

Zero-context agent reviewed EXTRACTION_PLAN/ROADMAP/README/AGENTS/.ai
against all four source repos. Disposition of findings:

## Blocking — all folded into the plan

1. **Exemption semantics undefined; sources contradict.** Portfolio exempts
   `completed/` from md-count only; petal exempts from everything. Decided:
   petal semantics (total exemption) for exemptDirs; ignoreDirs never
   walked; new exemptFiles class for generated files (CHANGELOG.md).
2. **Changesets breaks self-dogfooding.** `.changeset/*.md` + growing
   CHANGELOGs would violate budgets. Decided: `.changeset` in default
   ignoreDirs, CHANGELOG.md default exemptFile.
3. **Phase 1 schema couldn't express Phase 5 needs.** Portfolio has
   per-extension caps (scss 600), file-level data-manifest exemptions,
   test-file exclusions. Decided: codeLines accepts per-extension map;
   per-file exemptions escalated to Ian (open decision); test-pattern
   exclusion kept fixed.

## Worth noting — folded

4. `github:` install can't reach a workspace subpackage → pnpm pack /
   snapshot releases. 5. `git ls-files` must include `--others
   --exclude-standard` (untracked files). 6. Line-count off-by-one between
   sources → pinned to portfolio countLines. 7. eslint-disable scan scope
   clarified as inside brickwall; prose-comment false positive documented.
   8. Default ignore set (.claude/.github/.changeset) decided, ratification
   pending. 9. Monorepo config model escalated to Ian. 10. Exit codes
   0/1/2 specified. 11. Named portfolio WORKFLOW.md + clinical retro-first
   mechanics as explicit Phase 3/4 sources; petal markdownlint/coverage
   floors added to Phase 3. 12. Phase 2 marked as real API design, not
   lift-and-shift.

## Minor — folded or accepted

13. Node: engines >=20, develop on 24. 14. Phase 0 "dogfoods budgets"
    softened to "manually, pending Phase 1". 15. `cortex` bin ownership
    made a Phase 3 decision. 16. Exact-assert --json only. 17.
    Prettier-first attribution corrected to portfolio-only.

Verified by reviewer: 13-drift-check count accurate; WRC validators
genuinely unimplemented; cortex docs pass their own declared budgets.
