# Config-surface redesign proposal (2026-07-16)

Status: revision 4. Rev 1-3 were adversarially peer-reviewed three
times (zero-context; all blocking findings resolved). Rev 4 folds
Ian's second steer (2026-07-17): unify FURTHER — one selector grammar
for section membership AND tiers, so dirs and file patterns work
everywhere. Most items RATIFIED; the rev 4 shape below is the single
remaining item awaiting his final yes. Nothing implemented before it.

## Design principles

1. Relationships must be self-evident from key names.
2. Nothing escapes silently — every skip is visible in config.
3. Patterns, not extensions — `extname()` cannot express real repos.
4. Matching is naive, honest, and uniform: substrings and suffixes,
   never parsed language syntax.
5. Language-agnostic concepts only; nothing eslint- or TS-shaped.
6. NEW (Ian, ratification round): `docs` and `code` must READ the same
   — asymmetric sections confuse both humans and agents.

## Proposed shape, rev 4 (defaults shown; ONE selector grammar)

```jsonc
{
  "docs": {
    "matches": [{ "patterns": [".md"] }],   // membership, see below
    "maxCount": 25,                         // docs-only concept
    "maxLines": 80,
    "tiers": [
      { "dirs": [".ai/plans", ".ai/specs", "/docs"], "maxLines": 280 }
    ]
  },
  "code": {
    "matches": [{ "patterns": [".ts", ".tsx", ".js", ".jsx"] }],
    "maxLines": 250,
    "tiers": [],                    // e.g. [{ "patterns": [".scss"],
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

**The selector — Ian's second steer, and the whole design now**:
`{ dirs?, patterns? }`, ONE grammar used in exactly two places:

- **Section membership**: `matches` is a selector LIST — any selector
  claims the file. Rev 3 membership was extension-only; now docs
  sprinkled anywhere keep `[{ "patterns": [".md"] }]`, a repo whose
  docs/ dir is the whole truth writes `[{ "dirs": ["/docs"] }]` (any
  extension), and a mixed case writes `[{ "dirs": ["/docs"],
  "patterns": [".md", ".txt", ".html"] }]` — html is docs THERE, code
  elsewhere. The rev 3 `extensions` key is GONE: bare `.md` already
  normalizes to pattern `*.md`, so extensions were a second spelling
  of the same fact.
- **Tiers**: a selector + required `maxLines`. FIRST matching tier in
  config order wins; no match falls to the section's `maxLines`.

Selector semantics (both places, identically): within a field ANY
entry matches; across present fields ALL must match (scss only under
src/legacy); at least one field required, else config error (exit 2).
`matches: []` is a config error too — an empty list would silently
disable a whole section's checks, and nothing escapes silently. Two
identical selectors in one list: also an error.

**Cross-section claims** (4th peer review: without precedence, the
whole-docs-dir case would ERROR on any .ts file inside it — code
samples in docs dirs are normal): when both sections claim a file, a
selector WITH `dirs` beats one without (naming a place is more
specific than naming a type — so `{"dirs": ["/docs"]}` takes
/docs/example.ts away from the global code patterns, and html-in-docs
vs html-as-code-elsewhere works); if both have `dirs`, the longer
matched prefix wins; still tied → loud per-file config error naming
the file. Files matching neither section are not scanned (unchanged).
Documented caveats, naive by design: a dirs-only docs selector claims
binaries too — they consume `maxCount` and get line-counted (pair
`patterns` when a dir is mixed); non-code files matching
`testFilePatterns` under a docs claim are ordinary docs
(`testFilePatterns` is code-only).

Docs keep the COUNT cap (total across everything `matches` claims;
doc sprawl is the disease brickwall treats — nobody caps code file
count), code keeps TEST files. The remaining asymmetry is conceptual,
not structural.

Pattern grammar: entries normalize to `*<suffix>` (bare `.scss` =
`*.scss`), matched against the basename — so `README.md` also catches
`API-README.md`, naive by design. Duplicate rule (peer review):
duplicates WITHIN one selector's `patterns` are a config error, as are
two tiers with identical `(dirs, patterns)`; the SAME pattern across
different tiers is legitimate first-match layering (src/legacy scss at
600, all other scss at 400). `testFilePatterns` stay naive path
substrings. Dir entries follow ratified item 6 (bare = any depth,
slash = root prefix, leading `/` root-anchors).

Guard (peer review): a tier matching zero scanned files warns as
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
- **Non-md docs** (his .txt question): covered by `matches` patterns —
  no dedicated key needed at all. Default membership stays md-only;
  growing that DEFAULT stays roadmapped.
- **"What if docs have no special directory / are sprinkled?"** (his
  rev 4 steer): membership by patterns needs no dirs; membership by
  dirs needs no patterns; both combine. Same grammar either way.
- **"Can't the config file be a file brickwall knows to ignore?"**
  (item 5 self-flag): under defaults it already is — `.json` matches
  no default selector, so `brickwall.config.json` is never scanned
  (config-relative, not structural: a dirs-only selector over the root
  would claim it). The self-flag lives in brickwall's own TypeScript
  source, where `DEFAULT_CONFIG` names the pragma. His instinct IS the
  fix: those default values move to a JSON data file no default
  selector reads. Visible data, no inline dodge.

## Ratification status

| Item | Status |
| ---- | ------ |
| 1. `docs`/`code` groups replace flat budgets | RATIFIED |
| 2. tiers replace storyDirs/storyLines | RATIFIED as concept |
| 3+4 unified selector grammar (`matches` + tiers) | **OPEN — the rev 4 shape above** |
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
- Portfolio config under rev 4:
  `code.matches: [{ "patterns": [".ts", ".tsx", ".js", ".jsx",
  ".scss"] }]` + one scss tier — same constraints, fewer concepts.
- Behavioral no-op to protect in the test rewrite: old md detection
  was path-`endsWith('.md')`, new is basename-suffix `*.md` — provably
  identical for slash-free patterns; don't let anyone "fix" it.
