# Handoff: interview-first session (from alpha session, 2026-07-16)

You are the next cortex orchestrator. Unlike the last session (which ran
a task queue autonomously), THIS session starts with an INTERVIEW — Ian
has accumulated questions and ideas he wants discussed before new work.
Do not implement anything before the interview settles direction.

## Read first (in order)

AGENTS.md → .ai/CONTEXT.md → .ai/WORK.md → .ai/RULES.md →
.ai/ANTI-PATTERNS.md (note the NEW git-add entry) → .ai/specs/cleanup.md
→ .ai/specs/ians-brain.md (READ THE WHOLE FILE — Ian added sections the
last orchestrator never discussed with him) → docs/EXTRACTION_PLAN.md →
.ai/BACKLOG.md. Archived context: .ai/completed/ has the alpha handoff,
both dogfood plans (with full semantic-delta records), and Phase 1.1.

## State you inherit

Alpha reached 2026-07-16: brickwall 97 tests green, dogfooded in petal
(f5575d0) and ianrios.github.io (b27ab5a) via vendored tarballs; CI
workflow on github.com/ianrios/cortex (verify its first runs are green
— gh CLI is installed and authed); publish deliberately deferred by Ian;
snapshot flow verified (0.1.0-alpha-*). WORK.md open questions carry the
dogfood friction list — that list is the roadmap input.

## The interview (the session's first deliverable)

Group questions, don't machine-gun. Cover, at minimum:

1. **cleanup.md, item by item** — it mixes three kinds: pre-release
   chores (de-Ian-ing, README tone, legacy doc deletion), design
   questions he wants EXPLAINED to him (what .ai/ files are for whom;
   index.ts barrel; USAGE.md vs package README drift; monorepo/multi-
   repo semantics and --all scoping; scaling to 100k files), and
   direction calls (mastering metaphor retracted; "cortex init" scope —
   is the .ai/ convention itself a shippable package?). For the
   explain-items: teach, then ask if the answer changes his priorities.
2. **ians-brain.md new sections** — at least: git-aware brickwall
   (diff-only mode), config-from-existing-sources (eslint char limits),
   "use within the development chain" vs the repo's possibly-too-rigid
   quality-gate prose (he flagged AGENTS.md), file compression, custom
   agents with scoped skills (his longest-running thread), The Great
   Flattening distillation. He wants DISCUSSION, not just acknowledgment.
3. **How brickwall works, taught to Ian** — he wants to audit the
   consumers himself. Walk him through: config resolution, the walker
   (git ls-files + unstaged-deletion fix), check semantics, warnings,
   --all. Then open petal's brickwall.config.json and the portfolio's
   together and let him verify they match his expectations.
4. **His suspicion about leftover scripts** — petal kept only setup.sh;
   the portfolio DELIBERATELY kept scripts/validate.ts +
   drift-checks/component-checks/value-sync (the 13 drift checks are
   Phase 2 userland material per the handoff; optimize-images.ts is
   unrelated tooling). If he expected zero scripts, that's a Phase 2
   scoping conversation, not a migration bug. Confirm with him.
5. **Next step** — candidates, HIS pick: more dogfooding (he is cloning
   more repos locally — get paths), pre-release cleanup from cleanup.md,
   Phase 2 drift harness, or friction fixes from WORK.md. Do not assume.

## After the interview

Whatever he picks: plan in .ai/plans/ → zero-context peer review →
implement (scoped subagent or first-hand where observation IS the
deliverable) → verify by running things → fold docs → commit with the
Claude trailer → push. For new dogfood repos, the two archived dogfood
plans are the proven template (survey facts first-hand, map semantics,
document deltas, NEVER raise budgets silently, log friction in WORK.md).

## Gotchas that cost time last session

- Per-repo Node versions: petal needs 24 (nvm), portfolio 20; check
  .nvmrc/engines BEFORE installing anything.
- Stage by explicit path — never `git add -A` (anti-pattern, it burned
  us: swept a DO-NOT-COMMIT file into a pushed commit).
- Tarball updates need a fresh `pnpm add`/`npm i` (integrity pins).
- The pragma regex flags comments that merely MENTION eslint-disable —
  including ones you write during a migration.
- `changeset version --snapshot` CONSUMES changeset files — commit
  before dry-running, recover with reset + clean.
- Ian's approval semantics: "whatever is better" is NOT approval; new
  direction needs his explicit yes.
