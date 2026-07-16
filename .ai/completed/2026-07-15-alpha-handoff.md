# Handoff: Cortex Alpha Session (from founding session, 2026-07-15)

You are the orchestrator for the next cortex session. Everything below is
true as of commit time; verify against WORK.md if commits followed.

## Mission

Take cortex from "Phase 1 shipped" to an **alpha**: Phase 1.1 landed;
brickwall dogfooded in at least petal and ianrios.github.io; a snapshot
version consumable outside this repo; CI running `pnpm check` + tests.

## Read first (in order)

AGENTS.md → .ai/CONTEXT.md → .ai/WORK.md → .ai/RULES.md →
.ai/ANTI-PATTERNS.md → docs/EXTRACTION_PLAN.md →
.ai/plans/phase-1.1-limiter-refinements.md (incl. amendments) →
.ai/specs/ians-brain.md → docs/USAGE.md. Backlog: .ai/BACKLOG.md.

## Operating model (proven this session — keep it)

Orchestrator plans and reviews; scoped subagents implement (precise
brief, file allowlist, never commit, main tree is fine); EVERY plan gets
a zero-context peer-review subagent before implementation (it caught 3
blocking design flaws in the founding plan — do not skip); orchestrator
verifies everything first-hand (run the CLI, run the tests, try a
violating file) before committing. Doc folding at every phase close.
Launch review and implementation SEQUENTIALLY (mid-flight amendments
caused rework once). Ian approval: new direction only; phases inside
this handoff proceed autonomously. "Whatever is better" ≠ approval.

## Task queue

1. **Phase 1.1**: rerun the zero-context review of the plan (first
   attempt died to a session limit), fold findings, then a scoped
   subagent implements. Includes the reviewer weighing the
   `exemptDirs` → `archiveDirs` rename and the suspicious-ignore
   heuristic (Ian leans janitor-agent instead; don't build the heuristic
   without his sign-off).
2. **Dogfood petal**: `pnpm pack` brickwall; install tarball in
   /Users/ianrios/Sites/petal; replace scripts/validate-doc-lines.js and
   check-no-eslint-disable.js in its lint chain. Expect config friction —
   log every missing knob in .ai/WORK.md open questions; that friction IS
   the roadmap. Do not force petal green by raising budgets silently.
3. **Dogfood ianrios.github.io**: replace only the structural checks in
   scripts/validate.ts (md-count/doc-size/code-size/eslint-disable);
   the 13 drift checks STAY (they're Phase 2 userland material). Needs
   per-extension map (scss 600) and per-file exemptions (data.ts,
   adminData.ts → warn semantics from 1.1).
4. **Alpha plumbing**: changeset snapshot version; GitHub Actions
   workflow (install → build → test → self-check) on cortex; tag or
   snapshot-publish decision goes to Ian.

## Guardrails

Budgets are law (repo must pass `pnpm check` at every commit); zero
runtime deps in brickwall; `--json` shape may still break pre-publish
but note it in the package README changelog section; no eslint-disable
anywhere; commit messages end with the Claude co-author trailer.

## Known state

Phases 0–1 done and Ian-ratified (name included). Decisions recorded in
EXTRACTION_PLAN "Decisions" section — do not relitigate. Presets =
post-publish (BACKLOG). Machine sweep findings in
.ai/specs/home-framework-mining.md (mine, don't resurrect). X article
link in ians-brain.md is unread (X blocks server fetches) — ask Ian to
paste text if it comes up.
