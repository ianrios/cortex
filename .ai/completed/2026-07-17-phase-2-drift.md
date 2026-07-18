# Phase 2: drift-check harness (2026-07-17)

Status: peer-reviewed (zero-context, 2026-07-17; reviewer empirically
typechecked the generic-inference claims — they hold). Both blocking
findings folded below. Phase 2 of the approved founding plan — proceeds
autonomously; the PACKAGE NAME is flagged for Ian's veto.

## What it is

Extract the registry/runner pattern from the portfolio's `validate.ts`:
a check registry whose KEYS are the violation-type union
(`keyof typeof checks`), whose values are pure functions returning
message arrays, with IO living in the consumer's shell script. The
engine ships the runner + reporting; every actual check stays userland.

## Package: `@ianrios/drift` (`packages/drift`)

Name rationale: says exactly what it checks (docs/config/data drifting
from code); mastering metaphor retracted, clear names win. Ian may veto.

## API (the whole surface)

```ts
import { runChecks, formatChecks } from '@ianrios/drift';

const result = runChecks({
  'token-sync': () => checkTokenSync(scssTokens, rootVars),
  // ...12 more — keys stay the consumer's literal union
});
const out = formatChecks(result, { json: cli.json });
// out: { exitCode: 0 | 1 | 2, stdout?, stderr? }
```

- `runChecks<K extends string>(checks: Record<K, () => string[]>)` →
  `{ violations: { type: K; message: string }[], errors: { type: K;
  error: string }[] }`. Generic preserves the consumer's key union —
  the whole point of the pattern survives extraction.
- Checks are LAZY (`() => string[]`): a throwing check becomes an
  `errors` entry instead of killing the run mid-report (today a throw
  in check #3 hides the results of checks #4-13 behind a stack trace).
- `formatChecks`: human output matching the established style
  (`[type] message` grouped, ✅/❌ verdict) or `--json`-stable
  `{ violations, errors }` on stdout. Exit 0 clean / 1 violations /
  2 any check errored. Rationale (peer review, precise version): the
  cross-package META-semantic is 0 = clean verdict, 1 = dirty verdict,
  2 = NO VALID VERDICT. brickwall reaches 2 before checks run (config/
  usage); drift also reaches it when a userland check throws at runtime
  — different trigger, same meaning. Exit 1 for a crash would falsely
  assert "drift found" and let a crashing check masquerade as an
  ordinary red build. Gets ADR 0004 (with collision semantics).
- Consumer typing gotchas (verified by the reviewer with tsc):
  annotating the registry `Record<string, () => string[]>` silently
  widens the key union away — README warns "don't annotate"; a
  negative test pins it. Spread overrides are SILENT (last wins, no
  diagnostic) — only same-literal duplicate keys error.
- Zero runtime dependencies, ESM, Node >= 20 — same trust posture as
  brickwall. NO CLI bin: checks are userland code; consumers run their
  own script (tsx/node). No config file: the registry IS the config.

## Namespacing/collisions (the EXTRACTION_PLAN design question)

Resolved by composition at the object-literal level: future prebuilt
check packs arrive as objects the consumer spreads into their registry.
Honest guarantee (peer review): duplicate LITERAL keys are a compile
error; a spread override is last-wins and UNFLAGGED. Acceptable until
a real pack exists — the harness adds no runtime namespacing machinery.
Recorded in ADR 0004; revisit only if a real pack ships.

## Proof: portfolio migration (same session)

`validate.ts` keeps: all IO/parsing, the 13 check functions, the
registry literal (entries wrapped in closures — tsc FORCES the wrap,
eager `string[]` values don't compile against `() => string[]`). It
drops: the Violation type, flag(), the report loop, exit handling.
"Identical" defined precisely (peer review): same VIOLATION SET and
same exit codes on non-error paths; human text follows the new shared
format (human output is free to change, per brickwall precedent); the
error path CHANGES deliberately (uncaught throw exit 1 → captured
error exit 2). The pre-registry parse phase (file reads) is outside
the harness's error isolation — the migrated script wraps it in
try/catch → exit 2 so a missing SCSS file gets a clean "no valid
verdict" too. walkDir/IGNORE_DIRS stay userland (drift owns no file
discovery).

Consumption is pre-publish: build drift, `pnpm pack`, vendor the
tarball into the portfolio (`vendor/`, `file:` dep like brickwall),
fresh install, run under tsx.

## Tests

Unit: key-union typing compiles (typecheck-level), lazy evaluation,
error capture, exit-code mapping, exact `--json` shape, human format.
Fixture-level: a tiny registry with passing/failing/throwing checks.

## Out of scope

Prebuilt check packs; any file walking; config files; watch mode;
brickwall integration beyond sharing output conventions.

## Cortex-side integration (peer review, mechanical)

Scaffolding (tsconfig/vitest/package.json) is `cp`'d from brickwall
per ANTI-PATTERNS; changeset added; CI gains a node-20 floor proof of
drift's dist (`node -e "import(...)"` — no bin to run; the engines
floor is not the toolchain's floor); brickwall.config.json gains a
fixtures ignore entry only if drift grows a fixtures dir.

## Done means

Package green under cortex gates (its own budgets apply); portfolio
validate.ts consuming it, verified per the definition above + break-
tests; ADR 0004 written; EXTRACTION_PLAN Phase 2 folded; README ≤80
written; Ian shown the name for veto.
