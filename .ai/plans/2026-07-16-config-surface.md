# Config-surface redesign proposal (2026-07-16)

Status: revision 2, for Ian's NAME-BY-NAME ratification. Rev 1 was
adversarially peer-reviewed (zero-context); all 6 blocking findings are
resolved in place below. Nothing is implemented until Ian says yes per
item. Every key/flag is frozen public API at first publish — this is
the one cheap moment to rename.

## Design principles

1. Relationships must be self-evident from key names (the
   md/story/count confusion is a naming bug, not a docs bug).
2. Nothing escapes silently — every skip is visible in config.
3. Patterns, not extensions — `extname()` cannot express real repos.
4. Matching is naive, honest, and uniform: substrings and suffixes,
   never parsed language syntax; most-specific match wins everywhere.
5. Language-agnostic concepts only (brickwall's principle, per
   ians-brain.md); nothing eslint- or TS-shaped in the key names.

## Proposed shape (defaults shown)

```jsonc
{
  "docs": {
    "maxCount": 25,                 // was budgets.mdFileCount
    "maxLines": 80,                 // was budgets.mdLines
    "tiers": [                      // was storyDirs + budgets.storyLines
      { "dirs": [".ai/plans", ".ai/specs", "/docs"], "maxLines": 280 }
    ]
  },
  "code": {
    "extensions": [".ts", ".tsx", ".js", ".jsx"],  // was codeExtensions
    "maxLines": 250,                // was budgets.codeLines; number or
                                    // suffix map: { "*.scss": 600,
                                    // "*.storybook.py": 500, "*": 250 }
    "testFilePatterns": [".test.", ".spec."]       // was hardcoded regex
  },
  "bannedPragmas": ["eslint-disable"],  // was banEslintDisable: true
  "archiveDirs": [".ai/completed", "docs/archive"],
  "exemptFiles": ["CHANGELOG.md"],
  "ignoreDirs": ["node_modules", ".git", "dist", "build", "coverage",
    ".changeset", ".claude", ".github", ".vscode", ".codex", ".cursor"]
}
```

Merge semantics (explicit per peer review): `docs`/`code` groups merge
per key over defaults; every array AND the `code.maxLines` map replace
wholesale; `tiers[].maxLines` is required per tier (no inherited
default inside a tier). `cortex init` writes resolved arrays (ratified).

## Items for ratification

### 1. `docs` / `code` groups replace flat `budgets` + scattered keys

Why: `mdFileCount` next to `storyLines` next to `codeExtensions` hides
which knob belongs to which check. Grouping answers "are stories
counted differently than md files?" structurally: everything under
`docs` shares one count; tiers only change the per-file line cap.
Note: a `docs.extensions` key (html/mdx docs) was in rev 1 and is
DROPPED — no dogfood repo has needed it; the grouped shape leaves room
without shipping speculative syntax (the `extends` lesson).

### 2. `docs.tiers` replaces `storyDirs`/`storyLines`

Why: "story" is opaque outside these repos; a `docDirs` rename would
still hardcode exactly two tiers. Generic tiers are the multiband idea
with clear names (metaphor retracted, capability kept): plan docs vs
reference docs each get a tier without new keys. Resolution: the
most-specific (longest) matching dir entry wins; config order breaks
ties — same philosophy as item 3, per peer review.
Alternative if tiers feel heavy: flat rename to `longformDirs` /
`longformMaxLines`. Recommendation: tiers. Gets an ADR either way.

### 3. `code.maxLines` map keys become suffix patterns

Grammar (peer review demanded one): every key normalizes to
`*<suffix>` — bare `.scss` is shorthand for `*.scss`; `*` alone is the
explicit fallback. Match = basename ends with `<suffix>`; longest
suffix wins; two keys normalizing identically (`.scss` + `*.scss`) are
a config ERROR. A map must contain `*` or cover every
`code.extensions` entry — nothing silently uncapped.
Why: `*.storybook.py: 500` vs `*.py: 250` is inexpressible today.

### 4. `code.testFilePatterns` + closing the pragma-ban escape

Why (ratified): test files are filtered before ANY code check today,
so they silently escape the pragma ban and the README overclaims. New
behavior: test files skip `code.maxLines` only; `bannedPragmas`
applies to EVERY code file, tests included. Patterns are naive
substrings matched against the posix path — `test_` and `__tests__/`
conventions are one entry each, no glob engine.
Self-check paradox (peer review): brickwall's own tests hold literal
`eslint-disable` fixtures inline, which the closed ban would flag, and
"fixing" them via string-splitting is the inline dodge ANTI-PATTERNS
bans. Resolution: pragma-bearing test DATA must live in fixture FILES
under a dir the repo's config visibly lists (cortex: `test/fixtures`
in its own `ignoreDirs`), never inline in source. `--audit` still sees
fixture dirs, so nothing is invisible. Cortex's migration includes
moving those literals; this convention goes in the README.

### 5. `bannedPragmas` list replaces `banEslintDisable` boolean

Why (ratified): the concept is "no inline escape-hatch pragmas", not
"no eslint". Matching REDEFINED per peer review (the old regex only
understood `//` and `/* */`, so listed pragmas like `# noqa` could
never fire): a banned pragma is a bare per-line substring match in any
code file. No comment parsing at all — maximally naive, fully
language-agnostic, and prose mentions flag deliberately (unchanged
philosophy, now honestly stated). This widens the current check:
`eslint-disable` inside a plain string now flags too. Fixture-file
convention (item 4) is the designed escape. `[]` disables.
Default stays `["eslint-disable"]`; suggested additions (`# noqa`,
`biome-ignore`, `@ts-nocheck`) documented, opted into per repo —
enriching defaults later would add violations on upgrade.
Self-flag instance (peer review, rev 2): `DEFAULT_CONFIG` in brickwall's
own `src/config.ts` must contain the literal `eslint-disable`, which a
bare-substring scan flags in shipped source. Designed escape: default
pragma VALUES move to a small imported JSON data file — JSON is outside
`code.extensions`, so never scanned; visible data, not an inline dodge.
The same route serves any consumer whose real code must name a pragma.
`--json` impact: violation type `eslint-disable` renames to
`banned-pragma` (message names the matched pragma). Pre-publish, so
free now, breaking later. Gets an ADR.

### 6. Unified dir matching for `archiveDirs` / `tiers[].dirs`

Rule (extended per peer review): bare single-segment names match as a
path segment at ANY depth; slash-containing entries match as
root-relative prefixes; a LEADING `/` forces root-anchoring for
single-segment names (`"/docs"` = root docs/ only). Normalization
strips the leading `/` first, then applies the slash rule — so
`"/docs/archive"` ≡ `"docs/archive"`. One rule for EVERY dir list,
`ignoreDirs` included. Kills the archiveDirs-vs-ignoreDirs asymmetry
open question.
Defaults keep today's behavior via the new grammar: the default tier
and archive entries use `"/docs"`-style anchoring where bare names
would otherwise widen scope (rev 1 silently loosened every
`packages/*/docs` to 280 lines — caught in review, fixed above).

### 7. CLI modes: diff-only default (ratified direction), `--full`, `--audit`

- `brickwall` (no flags) → DIFF MODE. The walk still runs repo-wide
  (paths are cheap); `docs.maxCount` and the exemption-debt/stale
  warnings audit stay REPO-WIDE because they are path-only — rev 1
  broke warnings semantics in diff mode (stale-exemption false
  positives); resolved by never diffing path-only checks. Only
  content checks (doc-size, code-size, pragmas) restrict to changed
  files: `git diff --name-only <base>` (deletions excluded — the
  petal crash class) + staged + untracked, intersected with the walk.
- `--base <ref>` defaults to `HEAD` ("my current work": staged +
  unstaged + untracked). CI on a PR wants `--base origin/main`.
  Untracked/uncommitted files are always included regardless of base.
- `--full` → today's behavior: read and check everything.
- `--audit` → RENAME of `--all` (fs walk, shields off). Says what it
  does; also retires the `--all`/`--any` ambiguity before it exists.
- `--json` orthogonal; `{ violations, warnings }` unchanged, plus a
  top-level `"mode"` field. Exit codes 0/1/2 unchanged.
- Non-git repo: diff is impossible, falls back to `--full` with a
  stderr note — falling back STRICTER when the mode cannot exist is
  not environment magic; auto-detecting CI would be (rejected below).

**The blast radius (peer review: rev 1 undersold it — every existing
real invocation breaks, not just fresh-checkout CI):**
- petal `.husky/pre-push` → bare `brickwall`: work is committed at
  push time, diff-vs-HEAD is empty → the gate goes permanently
  vacuous. Must become `--full` (or `--base origin/main`).
- cortex's own `ci.yml` and `pnpm check` script: same, must be `--full`.
- Any pre-commit user intending staged-only: base=HEAD also checks
  unstaged/untracked — documented, and a `--staged` flag stays
  UNBUILT until someone actually needs it.

**Decision for Ian**: (a) explicit migration — CI/hook recipes say
`--full`, both dogfood repos + cortex updated when this lands
(recommendation: explicit beats magic, "nothing silently ignorable");
or (b) auto-detect `CI=true` → full (rejected by principle 2, listed
for completeness). Gets an ADR.

### 8. Reserved, designed-not-built

- Top-level `overrides: [{ dirs, ...partial }]` — the ratified
  monorepo model; reserving the key keeps items 1-3 nestable later.
- `extends` for arrays — still NOT designed (needed zero times in two
  migrations); replace semantics + resolved-array init hold.
- `docs.extensions`, `--staged` — named here so the ideas aren't lost,
  built only on demonstrated need.

## What does not change

Exit codes; config discovery (config file XOR package.json key);
unknown-key rejection (old configs fail LOUDLY, never silently
half-work); warnings channel semantics (explicitly repo-wide in every
mode, per item 7); zero runtime dependencies; walker mechanics.

## Migration bill (complete, per peer review)

- Both dogfood configs (~10 lines each; the portfolio's four-entry
  extension map collapses to `{ "*.scss": 600, "*": 250 }` +
  `extensions`; petal writes its tier's 280 explicitly).
- petal `.husky/pre-push` and cortex `ci.yml` + root `check` script
  gain `--full`.
- Cortex's own `brickwall.config.json`: bare `"docs"` becomes `"/docs"`
  in the tier form (preserves today's root-only scope).
- Cortex's pragma test fixtures move from inline literals into files
  under `packages/brickwall/test/fixtures` (already in cortex's
  `ignoreDirs`); default pragma values extract to a JSON data file
  (item 5's self-flag escape).
- README/USAGE rewrite; ~97 tests touched mechanically; `--json`
  violation-type rename. No external consumer exists yet — this bill
  never gets smaller than today.

## ADRs on ratification

Items 2 (tiers vs flat rename), 5 (naive substring pragma matching),
and 7 (diff default + explicit `--full` migration) have real
alternatives → each gets a short ADR in docs/adr/ when Ian decides.
