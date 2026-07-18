# @ianrios/cortex

The cortex scaffolder. `cortex init` vendors the REPO-OWNED layer of
the cortex toolkit into your repo: the `.ai/` agent-context skeleton,
an `AGENTS.md`/`CLAUDE.md` starter pair, a fully-resolved
`brickwall.config.json`, and proven gate starters. Zero runtime
dependencies. ESM-only. Node >= 20.

## Usage

```bash
npx @ianrios/cortex init            # scaffold into the cwd
npx @ianrios/cortex init --dir x    # or elsewhere (created if missing)
```

Exit codes: `0` done, `1` runtime failure, `2` usage error.

## What lands

- `.ai/` — CONTEXT, WORK, RULES, ANTI-PATTERNS, BACKLOG skeletons plus
  `plans/`, `specs/`, `completed/` (the archival lifecycle). Templates
  carry the transferable lessons; placeholders mark what is yours.
- `AGENTS.md` (agent entry point) + `CLAUDE.md` (pointer to it).
- `brickwall.config.json` with every default array WRITTEN OUT — array
  keys replace defaults wholesale, so nothing is invisible to lose.
- Starters: `.prettierrc.json`, `.markdownlint.cjs`, `knip.json`.
  Pair with `@ianrios/eslint-config` for the lint core.

## The contract

- **Never overwrites.** Existing files are skipped and reported,
  whatever their content. Partial adoption is fine; the report flags
  wiring gaps (e.g. your existing CLAUDE.md not pointing at the new
  AGENTS.md).
- **The files are yours the moment they land** (shadcn model). Edit
  freely; drift from the templates is a feature. There is no sync.
- A fresh scaffold passes `brickwall --full` out of the box — the
  budgets it configures are satisfied by the files it ships.
