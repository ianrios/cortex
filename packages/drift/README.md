# @ianrios/drift

A registry/runner harness for repo-specific drift checks — the checks
that catch docs, config, and data drifting away from code. You write
the checks; drift runs them with typed keys, error isolation, and a
stable machine surface. Zero runtime dependencies. ESM-only. Node >= 20.

## The pattern

Your registry's KEYS are your violation-type union. Registering a check
IS declaring its type — the two can never drift apart:

```ts
import { formatChecks, runChecks } from '@ianrios/drift';

// Parse once, up front. IO is yours; checks stay pure.
const tokens = parseTokens(readFileSync('src/styles/_tokens.scss', 'utf-8'));

const result = runChecks({
  'token-sync': () => checkTokenSync(tokens, rootVars),
  'demo-missing': () => checkDemoMissing(components, demos),
  // keys: your literal union; values: () => string[] of messages
});

const out = formatChecks(result, { json: process.argv.includes('--json') });
if (out.stdout) process.stdout.write(out.stdout);
if (out.stderr) process.stderr.write(out.stderr);
process.exit(out.exitCode);
```

Do NOT annotate the registry as `Record<string, () => string[]>` — that
silently widens your key union to `string`. Let inference read the
literal keys. Eager values (`check()` instead of `() => check()`) do
not compile — the wrap is what buys error isolation.

## Semantics

- Checks run in registry order. A THROWING check becomes an `errors`
  entry and every other check still runs — one broken parser no longer
  hides the other twelve verdicts behind a stack trace.
- Exit codes (ADR 0004 in the cortex repo): `0` clean, `1` drift
  found, `2` no valid verdict (a check crashed — a crash outranks
  violations, because nothing was fully checked). Wrap your pre-
  registry parse phase in try/catch → exit 2 for the same reason.
- `--json` shape `{ violations, errors }` (violations `{ type,
  message }`, errors `{ type, error }`, registry order) is the stable
  machine surface; human output is free to change.
- No CLI bin, no config file, no file walking: your script owns IO and
  discovery (pair with `@ianrios/brickwall` for structural budgets).
- Composition: spread prebuilt check packs into your registry.
  Duplicate literal keys are a compile error; a spread override is
  last-wins and unflagged — compose deliberately.
