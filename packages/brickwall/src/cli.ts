#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { run } from './run.js';
import { BrickwallConfigError } from './config.js';
import type { Violation } from './checks.js';

export interface CliArgs {
  json: boolean;
  configPath?: string;
}

/** Thrown for bad flags — maps to exit 2, same as a config error. */
export class CliUsageError extends Error {}

export function parseArgs(argv: string[]): CliArgs {
  let json = false;
  let configPath: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      json = true;
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
  return { json, configPath };
}

export interface CliOutput {
  exitCode: 0 | 1;
  stdout?: string;
  stderr?: string;
}

/** Pure: exit code 0 (clean) or 1 (violations found) — config/usage errors are exit 2, handled separately. */
export function formatResult(violations: Violation[], json: boolean): CliOutput {
  if (violations.length === 0) {
    return json
      ? { exitCode: 0, stdout: `${JSON.stringify([])}\n` }
      : { exitCode: 0, stderr: '✅ brickwall: within limits\n' };
  }
  if (json) {
    return { exitCode: 1, stdout: `${JSON.stringify(violations)}\n` };
  }
  const lines = ['', '❌ brickwall: budgets exceeded', ''];
  for (const v of violations) lines.push(`[${v.type}] ${v.message}`);
  lines.push('');
  return { exitCode: 1, stderr: `${lines.join('\n')}\n` };
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
    const { violations } = run({ cwd: process.cwd(), configPath: args.configPath });
    const output = formatResult(violations, args.json);
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
