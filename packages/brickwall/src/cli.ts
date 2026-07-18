#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { run, type RunMode } from './run.js';
import { BrickwallConfigError } from './config.js';
import type { Violation, Warning } from './checks.js';

export interface CliArgs {
  json: boolean;
  mode: RunMode;
  base?: string;
  configPath?: string;
}

/** Thrown for bad flags — maps to exit 2, same as a config error. */
export class CliUsageError extends Error {}

/** A value-taking flag must not swallow the next flag as its value
 *  (`--base --json` is a missing ref, not a ref named "--json"). */
function flagValue(value: string | undefined, message: string): string {
  if (!value || value.startsWith('-')) {
    throw new CliUsageError(message);
  }
  return value;
}

export function parseArgs(argv: string[]): CliArgs {
  let json = false;
  let full = false;
  let audit = false;
  let base: string | undefined;
  let configPath: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--full') {
      full = true;
    } else if (arg === '--audit') {
      audit = true;
    } else if (arg === '--base') {
      i += 1;
      base = flagValue(argv[i], '--base requires a git ref argument');
    } else if (arg === '--config') {
      i += 1;
      configPath = flagValue(argv[i], '--config requires a path argument');
    } else {
      throw new CliUsageError(`unknown flag "${arg}"`);
    }
  }
  if (full && audit) {
    throw new CliUsageError('--full and --audit are mutually exclusive');
  }
  const mode: RunMode = audit ? 'audit' : full ? 'full' : 'diff';
  if (base !== undefined && mode !== 'diff') {
    throw new CliUsageError('--base only applies to the default diff mode');
  }
  return { json, mode, base, configPath };
}

export interface CliOutput {
  exitCode: 0 | 1;
  stdout?: string;
  stderr?: string;
}

/** Pure: exit code 0 (clean) or 1 (violations found) — config/usage errors are
 *  exit 2, handled separately. Warnings NEVER affect the exit code. */
export function formatResult(
  result: {
    violations: Violation[];
    warnings: Warning[];
    mode: RunMode;
    note?: string;
  },
  args: { json: boolean },
): CliOutput {
  const { violations, warnings, mode, note } = result;
  const exitCode = violations.length === 0 ? 0 : 1;
  if (args.json) {
    // The stable machine surface: always { violations, warnings, mode }.
    return {
      exitCode,
      stdout: `${JSON.stringify({ violations, warnings, mode })}\n`,
      stderr: note ? `brickwall: ${note}\n` : undefined,
    };
  }
  const lines: string[] = [];
  if (mode === 'audit') {
    lines.push(
      'brickwall --audit: full-scope audit (ignore/archive/exempt lists disabled)',
    );
  }
  if (note) {
    lines.push(`⚠ ${note}`);
  }
  if (violations.length === 0) {
    lines.push(`✅ brickwall: within limits (${mode})`);
  } else {
    lines.push('', `❌ brickwall: budgets exceeded (${mode})`, '');
    for (const v of violations) lines.push(`[${v.type}] ${v.message}`);
    lines.push('');
  }
  if (warnings.length > 0) {
    lines.push('', '⚠ brickwall: warnings (never affect the exit code)', '');
    for (const w of warnings) lines.push(`[${w.type}] ${w.message}`);
    lines.push('');
  }
  return { exitCode, stderr: `${lines.join('\n')}\n` };
}

function main(): void {
  let args: CliArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`brickwall: ${(err as Error).message}`);
    process.exit(2);
  }

  try {
    const result = run({
      cwd: process.cwd(),
      configPath: args.configPath,
      mode: args.mode,
      base: args.base,
    });
    const output = formatResult(result, args);
    if (output.stdout) process.stdout.write(output.stdout);
    if (output.stderr) process.stderr.write(output.stderr);
    process.exit(output.exitCode);
  } catch (err) {
    if (err instanceof BrickwallConfigError) {
      console.error(`brickwall: ${err.message}`);
      process.exit(2);
    }
    throw err;
  }
}

// Only run when invoked directly (as the CLI bin), not when imported by tests.
function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isMainModule()) {
  main();
}
