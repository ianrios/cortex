#!/usr/bin/env node
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  realpathSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Thrown for bad args — maps to exit 2, like every cortex engine. */
export class CliUsageError extends Error {}

export interface InitReport {
  created: string[];
  skipped: string[];
  notes: string[];
}

const TEMPLATES_DIR = fileURLToPath(new URL('../templates', import.meta.url));

function walkTemplates(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkTemplates(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

/**
 * Copies every template into `targetDir`, per-file NEVER overwriting —
 * an existing file is skipped and reported, whatever its content. The
 * repo owns these files the moment they land (drift from the templates
 * is a feature, not a bug to sync away).
 */
export function init(targetDir: string): InitReport {
  mkdirSync(targetDir, { recursive: true });
  const created: string[] = [];
  const skipped: string[] = [];
  for (const template of walkTemplates(TEMPLATES_DIR).sort()) {
    const rel = relative(TEMPLATES_DIR, template).split(sep).join('/');
    const target = join(targetDir, rel);
    if (existsSync(target)) {
      skipped.push(rel);
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(template, target);
    created.push(rel);
  }

  // Pair-wired files: creating one half of a pair while the other half
  // already existed leaves a wiring gap the human should check.
  const notes: string[] = [];
  const pairs: [string, string, string][] = [
    ['CLAUDE.md', 'AGENTS.md', 'check that CLAUDE.md points at AGENTS.md'],
    ['AGENTS.md', '.ai/CONTEXT.md', 'check that AGENTS.md names the .ai/ startup order'],
  ];
  for (const [a, b, note] of pairs) {
    const aCreated = created.includes(a);
    const bCreated = created.includes(b);
    if (aCreated !== bCreated) notes.push(note);
  }
  return { created, skipped, notes };
}

export function formatReport(report: InitReport, targetDir: string): string {
  const lines: string[] = [];
  for (const f of report.created) lines.push(`  created  ${f}`);
  for (const f of report.skipped) lines.push(`  skipped  ${f} (exists — never overwritten)`);
  lines.push('', `cortex init: ${report.created.length} created, ${report.skipped.length} skipped in ${targetDir}`);
  for (const note of report.notes) lines.push(`  ⚠ ${note}`);
  if (report.created.length > 0) {
    lines.push(
      '',
      'Next steps:',
      '  1. Fill the <placeholders> in .ai/CONTEXT.md and AGENTS.md.',
      '  2. npm i -D @ianrios/brickwall, then wire ONE integration point',
      '     (agent hook, pre-push --full, or CI --full) — see its README.',
      '  3. The scaffolded files are YOURS now: edit freely, budgets apply.',
    );
  }
  return `${lines.join('\n')}\n`;
}

export function parseArgs(argv: string[]): { command: 'init'; dir: string } {
  const [command, ...rest] = argv;
  if (command !== 'init') {
    throw new CliUsageError(
      `usage: cortex init [--dir <path>] — unknown command "${command ?? ''}"`,
    );
  }
  let dir = '.';
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--dir') {
      i += 1;
      const value = rest[i];
      if (!value || value.startsWith('-')) {
        throw new CliUsageError('--dir requires a path argument');
      }
      dir = value;
    } else {
      throw new CliUsageError(`unknown flag "${rest[i]}"`);
    }
  }
  return { command: 'init', dir };
}

function main(): void {
  let args: { command: 'init'; dir: string };
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`cortex: ${(err as Error).message}`);
    process.exit(2);
  }
  try {
    const target = resolve(args.dir);
    const report = init(target);
    process.stderr.write(formatReport(report, target));
    process.exit(0);
  } catch (err) {
    // Runtime fs failure (EACCES, target is a file, ...): exit 1, one line.
    console.error(`cortex init failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

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
