# @ianrios/brickwall

A brickwall limiter for your repo's context — hard ceilings on docs and code
so agents never clip. Zero runtime dependencies. ESM-only. Node >= 20.

## What it checks

- `doc-count` — total doc files stays under `docs.maxCount`.
- `doc-size` / `code-size` — each file stays under its section's
  `maxLines`, or a matching tier's. Test files (`code.testFilePatterns`,
  naive path substrings) skip the size cap ONLY.
- `banned-pragma` — no `bannedPragmas` substring on any line of any code
  file — tests and `exemptFiles` included; only `archiveDirs` escape.
  No comment parsing: prose mentions flag deliberately. Keep pragma-
  bearing test data in fixture files under an ignored dir, never inline.

## Config

`brickwall.config.json` or a `"brickwall"` package.json key (not both).
Groups merge per key; ARRAYS REPLACE their defaults wholesale. One
selector grammar everywhere: `{ dirs?, patterns? }` — ANY entry within a
field, ALL present fields must match. Bare `.md` ≡ `*.md` (basename
suffix); dir entries: bare name = any depth, slash = root prefix,
leading `/` root-anchors. `matches` decides section membership (a
`dirs` claim beats patterns-only; deeper dir wins; ties error loudly).
`tiers` = selector + `maxLines`, first match in config order wins.

```jsonc
{
  "docs": {
    "matches": [{ "patterns": [".md"] }],
    "maxCount": 25,
    "maxLines": 80,
    "tiers": [
      { "dirs": [".ai/plans", ".ai/specs", "/docs"], "maxLines": 280 }
    ]
  },
  "code": {
    "matches": [{ "patterns": [".ts", ".tsx", ".js", ".jsx"] }],
    "maxLines": 250,
    "tiers": [],
    "testFilePatterns": [".test.", ".spec."]
  },
  "bannedPragmas": ["eslint-disable"],
  "archiveDirs": [".ai/completed", "docs/archive"],
  "exemptFiles": ["CHANGELOG.md"],
  "ignoreDirs": ["node_modules", ".git", "dist", "build", "coverage",
    ".changeset", ".claude", ".github", ".vscode", ".codex", ".cursor"]
}
```

Example configs (three, from real repos): see `docs/USAGE.md` in the
cortex repo.

## CLI

```bash
brickwall                 # DIFF mode: content checks on changed files only
brickwall --base main     # diff vs a ref (default HEAD)
brickwall --full          # read and check everything — use this in CI/hooks
brickwall --audit         # shields-off fs walk; audit view, NOT a gate
brickwall --json          # {"violations":[...],"warnings":[...],"mode":"..."}
brickwall --config path/to/brickwall.config.json
```

Exit codes: `0` pass, `1` violations, `2` config or usage error. Doc
COUNT and all warnings (`exemption-debt`, `stale-exemption`,
`stale-tier`) are path-only and repo-wide in every mode. A bare
`brickwall` in CI is vacuously green (nothing changed vs HEAD) — CI and
git hooks must say `--full`. Outside git, diff falls back to `--full`
with a note. Warnings NEVER affect the exit code.

## Programmatic use

```ts
import { run } from '@ianrios/brickwall';
const { violations, warnings, mode, config } = run({ cwd: process.cwd() });
```
