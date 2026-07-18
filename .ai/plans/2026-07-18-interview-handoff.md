# Handoff: interview-first session (from beta session, 2026-07-18)

You are the next cortex orchestrator. This session starts with an
INTERVIEW: Ian has done his own code review of the current state and
written findings into `.ai/specs/current-state-review.md` (read it
FIRST among specs — it did not exist when this handoff was written, or
was in progress; his findings outrank this doc's task ideas). Do not
implement before the interview settles direction.

## Read first (in order)

AGENTS.md → .ai/CONTEXT.md → .ai/WORK.md → .ai/RULES.md →
.ai/ANTI-PATTERNS.md → .ai/specs/current-state-review.md (Ian's) →
.ai/specs/ians-brain.md (four NEW sections dated 2026-07-17: session
cycle, deterministic backbones, cross-repo, init-as-investigation) →
.ai/specs/dogfood-queue.md → docs/EXTRACTION_PLAN.md → .ai/BACKLOG.md
(seven NEW entries). Archived context in .ai/completed/.

## State you inherit

Phases 0-3 DONE, pushed, CI green: @ianrios/brickwall (rev 4 selector
grammar, diff-default CLI), @ianrios/drift (proven via portfolio
validate.ts), @ianrios/eslint-config, @ianrios/cortex (`cortex init`;
scaffolding-only bin per ADR 0005). ALL FOUR NAMES RATIFIED by Ian.
ADRs 0001-0005 current as of 2026-07-18. petal (develop) + portfolio
(main) migrated to rev 4 and pushed; petal pre-push hooks need node 24
ON PATH (nvm) or the push fails. Drive standing suite: 7 NDA repos
swept (results ONLY on the drive tracker:
/Volumes/Extreme 510/Knowledgebase/CORTEX-DOGFOOD.md — NDA rule in
RULES.md is absolute). Publish still deferred; vendored tarballs.

## The interview (first deliverable)

1. **His current-state-review.md, item by item** — same treatment the
   original cleanup.md got: teach the explain-items, take direction.
2. **ADR 0005 discussion** — he wants to chew on scaffolding-only vs
   umbrella `cortex check`; walk him through the tradeoff and tripwire.
3. **Toolchain map** (BACKLOG) — his companion-tools questions incl.
   the line-LENGTH vs line-COUNT distinction (brickwall counts lines
   per file; character width is eslint max-len / markdownlint MD013 /
   prettier printWidth territory — cortex's own repo runs NONE of
   those on .ai/, which is why long-lined md passed honestly).
4. **Doc-count pressure**: cortex sits at exactly 25/25 with his two
   working specs EXEMPTED as visible debt (warnings fire every run —
   deliberate). Resolve via archive consolidation (below) and/or a
   ratified maxCount raise; never silently.

## Task candidates (his review steers priority)

- Archive consolidation: top-level archive/ absorbing .ai/completed +
  docs/archive; DELETE fully-out-of-scope archives (git keeps them).
  Frees doc-count headroom. Ratified 2026-07-17.
- Pre-release polish batch (BACKLOG): de-Ian, README tone, legacy-doc
  deletion, ASCII-brain branding (his spec file; "cortex" in negative
  space; static fine, 3D rotation stretch).
- Two investigator runs (BACKLOG, Ian queued): context-ingestion
  research; token-compression myths.
- Phase 4 prep: shipped-agent catalog doc first (peer reviewer +
  janitor lead; EVERY agent needs a deterministic backbone —
  ians-brain.md, non-negotiable).
- Dogfood: petal/portfolio onto @ianrios/eslint-config; sweep re-run
  after any engine change; deeper NDA-repo migrations.

## Operating model (unchanged)

Plan in .ai/plans/ → zero-context peer review BEFORE implementation
(this practice found ~20 blocking findings last session — do not skip)
→ implement → verify by RUNNING things → fold docs → commit explicit
paths with the Claude trailer → push. "Whatever is better" is not
approval. Interview him only at decisions that are his.

## Gotchas that cost time

- Per-repo node (nvm): petal 24.15.0, portfolio 20.19.0 — hooks
  inherit YOUR PATH; export before git push in petal.
- Bare `brickwall` is DIFF mode — gates/CI must say `--full` (ADR
  0001). Never wire `--audit` into CI.
- Pragma scan covers test files and string literals: pragma-bearing
  test data goes in fixture FILES under an ignored dir; pragma VALUES
  in code go in JSON data files (brickwall's banned-pragmas.json is
  the model).
- Stage by explicit path; never git add -A. Tarball updates need a
  fresh add (integrity pins). changeset version CONSUMES changesets.
- Budgets at the wall: 25/25 docs — archive or get Ian's yes before
  adding md files.
