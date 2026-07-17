# @ianrios/brickwall

A brickwall limiter for your repo's context — hard ceilings on docs and code
so agents never clip. Zero runtime dependencies. ESM-only. Node >= 20.

## What it checks

- `md-count` — total `.md` files (excluding `archiveDirs`/`exemptFiles`)
  stays under `budgets.mdFileCount`.
- `doc-size` — each `.md` file stays under `budgets.mdLines`, or
  `budgets.storyLines` under a `storyDirs` prefix.
- `code-size` — each code file (by `codeExtensions`, excluding `*.test.*` /
  `*.spec.*` and `exemptFiles`) stays under `budgets.codeLines`.
- `eslint-disable` — no `eslint-disable` comment in any code file (when
  `banEslintDisable` is true). Naive line regex: prose mentions flag too,
  deliberately. `exemptFiles` does NOT escape this ban; `archiveDirs` do.

## Config

Looked up at the cwd: `brickwall.config.json` or a `"brickwall"` key in
`package.json`. Both at once, or any unknown key, is a config error. No
config at all uses the defaults below. Array keys REPLACE their default
lists when set — they never extend them (setting `storyDirs` discards
the default entries); `budgets` merges per key over the defaults.

```jsonc
{
  "budgets": {
    "mdFileCount": 25,
    "mdLines": 80,
    "storyLines": 280,
    // A number caps all extensions; a map must cover every configured one.
    "codeLines": 250 // or { ".ts": 250, ".scss": 600 }
  },
  "storyDirs": [".ai/plans", ".ai/specs", "docs"],
  // Excluded from ALL checks and the md-count — the archival escape valve.
  "archiveDirs": [".ai/completed", "docs/archive"],
  // Excluded from md-count/doc-size/code-size, by basename or exact path.
  // Custom entries WARN as exemption debt; these defaults stay silent.
  "exemptFiles": ["CHANGELOG.md"],
  // Never walked at all.
  "ignoreDirs": [
    "node_modules", ".git", "dist", "build", "coverage",
    ".changeset", ".claude", ".github", ".vscode", ".codex", ".cursor"
  ],
  "codeExtensions": [".ts", ".tsx", ".js", ".jsx"],
  "banEslintDisable": true
}
```

## CLI

```bash
brickwall            # human output; ✅/❌ verdict then ⚠ warnings, to stderr
brickwall --json     # {"violations":[...],"warnings":[...]} to stdout
brickwall --all      # full-scope audit (below)
brickwall --config path/to/brickwall.config.json
```

Exit codes: `0` no violations, `1` violations found, `2` config or usage
error. Warnings NEVER affect the exit code. `--json` is the stable machine
surface: `{ violations, warnings }` — violations `{ type, message, file? }`,
warnings `{ type, message }` in config-entry order: `exemption-debt` (a
custom `exemptFiles` entry shields ≥1 scanned file; every match enumerated)
or `stale-exemption` (matches nothing).

`--all` is an audit view for humans/agents, NOT a CI gate: an fs walk
skipping ONLY `node_modules` and `.git`, with `ignoreDirs`/`archiveDirs`/
`exemptFiles` disabled. Build output and test fixtures WILL fire.

## Programmatic use

```ts
import { run } from '@ianrios/brickwall';
const { violations, warnings, config } = run({ cwd: process.cwd() });
```
