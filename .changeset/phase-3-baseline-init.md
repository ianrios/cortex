---
"@ianrios/cortex": minor
"@ianrios/eslint-config": minor
---

Phase 3 extraction. `@ianrios/cortex` ships `cortex init`: a per-file
never-overwrite scaffold of the repo-owned layer — `.ai/` skeleton
(CONTEXT/WORK/RULES/ANTI-PATTERNS/BACKLOG + plans/specs/completed),
AGENTS.md/CLAUDE.md starter pair, a fully-resolved
brickwall.config.json (nothing invisible to lose), and
prettier/markdownlint/knip starters; a fresh scaffold passes
`brickwall --full` out of the box. `@ianrios/eslint-config` ships the
generic strict flat-config core (strictTypeChecked +
stylisticTypeChecked, projectService on, hard-line rules); framework
plugins, ignores, and browser globals stay consumer-side.
