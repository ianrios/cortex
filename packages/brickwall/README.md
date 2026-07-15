# @ianrios/brickwall

A brickwall limiter for your repo's context — hard ceilings on docs and code
so agents never clip. Zero runtime dependencies. ESM-only. Node >= 20.

## What it checks

- `md-count` — total `.md` files (excluding `exemptDirs`/`exemptFiles`) stays
  under `budgets.mdFileCount`.
- `doc-size` — each `.md` file stays under `budgets.mdLines`, or
  `budgets.storyLines` under a `storyDirs` prefix.
- `code-size` — each code file (by `codeExtensions`, excluding `*.test.*` /
  `*.spec.*`) stays under `budgets.codeLines`.
- `eslint-disable` — no `eslint-disable` comment in any code file (when
  `banEslintDisable` is true).

## Config

Looked up, in order, at the current working directory: a
`brickwall.config.json` file, or a `"brickwall"` key in `package.json`.
Having both is a config error. No config file/key at all uses the defaults
below.

```jsonc
{
  "budgets": {
    "mdFileCount": 25,
    "mdLines": 80,
    "storyLines": 280,
    // A plain number applies to every codeExtensions entry. A map sets a
    // per-extension cap instead — every configured extension must have an
    // entry.
    "codeLines": 250 // or { ".ts": 250, ".scss": 600 }
  },
  "storyDirs": [".ai/plans", ".ai/specs", "docs"],
  // Excluded from ALL checks and the md-count — the archival escape valve.
  "exemptDirs": [".ai/completed", "docs/archive"],
  // Excluded from md-count and doc-size only (matched by basename or exact
  // relative path). CHANGELOGs grow monotonically and are generated.
  "exemptFiles": ["CHANGELOG.md"],
  // Never walked at all.
  "ignoreDirs": [
    "node_modules", ".git", "dist", "build", "coverage",
    ".changeset", ".claude", ".github"
  ],
  "codeExtensions": [".ts", ".tsx", ".js", ".jsx"],
  "banEslintDisable": true
}
```

Unknown keys (top-level or under `budgets`) are a config error.

## CLI

```bash
brickwall            # human output; ✅/❌ to stderr
brickwall --json     # machine-readable violations array to stdout
brickwall --config path/to/brickwall.config.json
```

Exit codes: `0` no violations, `1` violations found (never used for a config
problem), `2` config or usage error (bad config key, unreadable `--config`
path, both config sources present, unknown flag). `--json` is the stable
machine surface (an array of `{ type, message, file? }`); the human-readable
format is free to change wording/layout.

## eslint-disable matching is a naive line regex

Matches the source scripts this was extracted from: `//.*eslint-disable` or
`/\*.*eslint-disable.*\*/`. It does not parse comments or strings, so prose
like `// eslint-disable is banned here` is flagged even though it isn't a
real disable directive. Deliberate — matching known behavior, not a bug.

## Programmatic use

```ts
import { run } from '@ianrios/brickwall';

const { violations, config } = run({ cwd: process.cwd() });
```
