#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { run } from './run.js';
import { BrickwallConfigError } from './config.js';
import type { Violation, Warning } from './checks.js';

export interface CliArgs {
  json: boolean;
  all: boolean;
  configPath?: string;
}

/** Thrown for bad flags — maps to exit 2, same as a config error. */
export class CliUsageError extends Error {}

export function parseArgs(argv: string[]): CliArgs {
  let json = false;
  let all = false;
  let configPath: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--all') {
      all = true;
    } else if (arg === '--config') {
      i += 1;
      const value = argv[i];
      if (!value) {
        throw new CliUsageError('--config requires a path argument');
      }
      configPath = value;
    } else {
      throw new CliUsageError(`unknown flag "${arg}"`);
    }
  }
  return { json, all, configPath };
}

export interface CliOutput {
  exitCode: 0 | 1;
  stdout?: string;
  stderr?: string;
}

/** Pure: exit code 0 (clean) or 1 (violations found) — config/usage errors are
 *  exit 2, handled separately. Warnings NEVER affect the exit code. */
export function formatResult(
  result: { violations: Violation[]; warnings: Warning[] },
  args: { json: boolean; all: boolean },
): CliOutput {
  const { violations, warnings } = result;
  const exitCode = violations.length === 0 ? 0 : 1;
  if (args.json) {
    // The stable machine surface: always { violations, warnings }.
    return { exitCode, stdout: `${JSON.stringify({ violations, warnings })}\n` };
  }
  const lines: string[] = [];
  if (args.all) {
    lines.push('brickwall --all: full-scope audit (ignore/archive/exempt lists disabled)');
  }
  if (violations.length === 0) {
    lines.push('✅ brickwall: within limits');
  } else {
    lines.push('', '❌ brickwall: budgets exceeded', '');
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
      all: args.all,
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
