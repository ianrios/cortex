/**
 * The drift harness: a registry whose KEYS are the violation-type union
 * and whose values are lazy check functions. The consumer owns every
 * check, all IO, and all parsing; the harness owns running, error
 * isolation, formatting, and exit-code semantics (ADR 0004).
 *
 * Do NOT annotate your registry as `Record<string, () => string[]>` —
 * that silently widens the key union away. Let inference read the
 * literal keys.
 */

export interface DriftViolation<K extends string = string> {
  type: K;
  message: string;
}

/** A check that THREW: no valid verdict from it, reported separately. */
export interface DriftError<K extends string = string> {
  type: K;
  error: string;
}

export interface DriftResult<K extends string> {
  violations: DriftViolation<K>[];
  errors: DriftError<K>[];
}

/**
 * Runs every check in registry order. Checks are lazy (`() => string[]`)
 * so one throwing check becomes an `errors` entry instead of killing the
 * run mid-report — every other check still gets its say.
 */
export function runChecks<K extends string>(
  checks: Record<K, () => string[]>,
): DriftResult<K> {
  const violations: DriftViolation<K>[] = [];
  const errors: DriftError<K>[] = [];
  for (const type of Object.keys(checks) as K[]) {
    try {
      for (const message of checks[type]()) {
        violations.push({ type, message });
      }
    } catch (err) {
      errors.push({
        type,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return { violations, errors };
}

export interface FormatOptions {
  json?: boolean;
}

export interface FormattedChecks {
  exitCode: 0 | 1 | 2;
  stdout?: string;
  stderr?: string;
}

/**
 * Pure formatting + exit-code mapping. The meta-semantic shared across
 * cortex engines: 0 = clean verdict, 1 = dirty verdict, 2 = NO VALID
 * VERDICT (here: a check itself crashed, so nothing was fully checked).
 * `--json` (`{ violations, errors }` on stdout) is the stable machine
 * surface; human text is free to change.
 */
export function formatChecks<K extends string>(
  result: DriftResult<K>,
  options: FormatOptions = {},
): FormattedChecks {
  const { violations, errors } = result;
  const exitCode = errors.length > 0 ? 2 : violations.length > 0 ? 1 : 0;
  if (options.json) {
    return {
      exitCode,
      stdout: `${JSON.stringify({ violations, errors })}\n`,
    };
  }
  const lines: string[] = [];
  if (exitCode === 0) {
    lines.push('✅ drift: checks passed');
  }
  if (violations.length > 0) {
    lines.push('', '❌ drift: drift found', '');
    for (const v of violations) lines.push(`[${v.type}] ${v.message}`);
    lines.push('');
  }
  if (errors.length > 0) {
    lines.push('', '⚠ drift: check(s) crashed — no valid verdict', '');
    for (const e of errors) lines.push(`[${e.type}] ${e.error}`);
    lines.push('');
  }
  return { exitCode, stderr: `${lines.join('\n')}\n` };
}
