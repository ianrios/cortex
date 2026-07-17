# Config-surface redesign proposal (2026-07-16)

Status: revision 3. Rev 1-2 were adversarially peer-reviewed
(zero-context, 6+1 blocking findings, all resolved). Rev 3 folds Ian's
ratification round (2026-07-17): most items RATIFIED; the remaining
open design is the unified docs/code symmetry he asked for. Nothing is
implemented until the shape below gets his yes.

## Design principles

1. Relationships must be self-evident from key names.
2. Nothing escapes silently — every skip is visible in config.
3. Patterns, not extensions — `extname()` cannot express real repos.
4. Matching is naive, honest, and uniform: substrings and suffixes,
   never parsed language syntax.
5. Language-agnostic concepts only; nothing eslint- or TS-shaped.
6. NEW (Ian, ratification round): `docs` and `code` must READ the same
   — asymmetric sections confuse both humans and agents.

## Proposed shape, rev 3 (defaults shown; sections now symmetric)

```jsonc
{
  "docs": {
    "extensions": [".md"],          // restored: .txt/.rst repos exist
    "maxCount": 25,                 // docs-only concept (see below)
    "maxLines": 80,
    "tiers": [
      { "dirs": [".ai/plans", ".ai/specs", "/docs"], "maxLines": 280 }
    ]
  },
  "code": {
    "extensions": [".ts", ".tsx", ".js", ".jsx"],
    "maxLines": 250,
    "tiers": [],                    // e.g. [{ "patterns": ["*.scss"],
                                    //         "maxLines": 600 }]
    "testFilePatterns": [".test.", ".spec."]  // code-only concept
  },
  "bannedPragmas": ["eslint-disable"],
  "archiveDirs": [".ai/completed", "docs/archive"],
  "exemptFiles": ["CHANGELOG.md"],
  "ignoreDirs": ["node_modules", ".git", "dist", "build", "coverage",
    ".changeset", ".claude", ".github", ".vscode", ".codex", ".cursor"]
}
```

The two sections are identical — `extensions`, `maxLines`, `tiers` —
except each carries exactly one domain-specific key: docs have a COUNT
cap, total across all doc extensions (doc sprawl is the disease
brickwall treats; nobody caps code file count), code has TEST files
(docs don't). The asymmetry that remains is
conceptual, not structural.

**Shared tier shape** (this replaces rev 2's suffix-map, per Ian's
"why is code so different"): `{ dirs?, patterns?, maxLines }`. At least
one of `dirs`/`patterns` required; when both are present both must
match (e.g. scss only under src/legacy). FIRST matching tier in config
order wins; no match falls to the section's `maxLines`. One resolution
rule for both sections — rev 2 had longest-suffix for code maps and
order-based for doc tiers; that split is gone, and the map's
"must cover every extension" validation is unnecessary (the section
default always exists, nothing is ever uncapped).

Pattern grammar: entries normalize to `*<suffix>` (bare `.scss` =
`*.scss`), matched against the basename — so `README.md` also catches
`API-README.md`, naive by design. Duplicate rule, rescoped for tiers
(peer review): duplicates WITHIN one tier's `patterns` are a config
error, as are two tiers with identical `(dirs, patterns)`; the SAME
pattern across different tiers is legitimate first-match layering
(src/legacy scss at 600, all other scss at 400). Within `dirs` and
within `patterns` a tier matches on ANY entry; across the two fields
BOTH must match; a tier with neither is a config error (exit 2).
`testFilePatterns` stay naive path substrings.

Two guards (peer review): an extension in BOTH `docs.extensions` and
`code.extensions` is a loud config error — no file is ever scanned
under two regimes. A tier matching zero scanned files warns as
`stale-tier` (the `stale-exemption` pattern) — dead or fully-shadowed
tiers are never silent.

Merge semantics: groups merge per key; arrays (including `tiers`)
replace wholesale; `tiers[].maxLines` required per tier. `cortex init`
writes resolved arrays (ratified).

## Ian's ratification-round answers folded

- **Sprinkled docs** (1 stray .md in a components folder): counted in
  `docs.maxCount`, capped at the default 80 — today's behavior, kept.
  Tiers with `patterns` can now target strays by name (e.g. every
  `README.md` gets its own cap) if a repo ever needs it.
- **docs.extensions restored — PROPOSED, part of the open shape** (his
  .txt question): adding it later would have been non-breaking, but
  symmetry (principle 6) and known-plausible repos argue for now.
  Default stays `[".md"]`; growing that default is what stays
  roadmapped, not the key itself.
- **"Can't the config file be a file brickwall knows to ignore?"**
  (item 5 self-flag): it already is — `.json` is not a code extension,
  so `brickwall.config.json` is never scanned. The self-flag lives in
  brickwall's own TypeScript source, where `DEFAULT_CONFIG` names the
  pragma. His instinct IS the fix: those default values move to a JSON
  data file the scanner never reads. Visible data, no inline dodge.

## Ratification status

| Item | Status |
| ---- | ------ |
| 1. `docs`/`code` groups replace flat budgets | RATIFIED |
| 2. tiers replace storyDirs/storyLines | RATIFIED as concept |
| 3+4 unified tier shape, incl. restored `docs.extensions` | **OPEN — the rev 3 shape above** |
| 4b. testFilePatterns; pragma ban closes over tests | RATIFIED |
| 5. bannedPragmas, bare substring, JSON-data escape | RATIFIED |
| 6. one dir rule (bare=any depth, slash=root, `/`-anchor) | RATIFIED |
| 7. diff default, `--full`, `--audit`; explicit migration (option a) | RATIFIED → ADR 0001 |
| 8. reserved: overrides/extends/--staged/docs-ext growth | RATIFIED → ROADMAP |

Item 5's matching decision → ADR 0002. Item 7 details (repo-wide
walk + path-only checks in every mode; `--base` default HEAD;
deletions excluded; non-git falls back to `--full` with stderr note;
blast radius: petal pre-push, cortex ci.yml + check script, both
dogfood configs — all migrate to `--full` when this lands) are
unchanged from rev 2 and stand ratified.

## Scale facts (2026-07-17, real production repos, names off-repo)

Full content run on a 31,748-file non-git production monolith from an
external USB drive: 4.1s wall clock. A 2k-file git production repo:
0.9s. `--audit` over the 31k repo: 1.4s warm. Node is not the
bottleneck; the Rust rewrite question is closed by measurement (per
Ian's hard-facts-over-estimates rule), and diff mode is an ergonomic
optimization, not a rescue. Numbers recorded generically per the NDA
rule (RULES.md).

## What does not change

Exit codes; config discovery (config file XOR package.json key);
unknown-key rejection (old configs fail LOUDLY); warnings stay
repo-wide in every mode; zero runtime dependencies; walker mechanics.

## Migration bill (complete)

- Both dogfood configs (portfolio's scss map becomes one tier; petal
  writes its tier's 280 explicitly), cortex's own config (`"docs"` →
  `"/docs"`).
- petal `.husky/pre-push`, cortex `ci.yml` + root `check` → `--full`.
- Pragma test fixtures move inline→files under
  `packages/brickwall/test/fixtures` (already ignored); defaults
  extract to a JSON data file.
- README/USAGE rewrite; `--json` types `eslint-disable`→`banned-pragma`
  AND `md-count`→`doc-count` (docs may be non-md now; messages say
  "doc files"); ~97 tests touched mechanically. No external consumers.
