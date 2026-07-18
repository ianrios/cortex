import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_CONFIG, run } from '@ianrios/brickwall';
import { afterEach, describe, expect, it } from 'vitest';
import { CliUsageError, formatReport, init, parseArgs } from '../src/cli.js';

const require = createRequire(import.meta.url);

describe('parseArgs', () => {
  it('accepts init with optional --dir', () => {
    expect(parseArgs(['init'])).toEqual({ command: 'init', dir: '.' });
    expect(parseArgs(['init', '--dir', 'x'])).toEqual({ command: 'init', dir: 'x' });
  });
  it('rejects unknown commands, flags, and missing/flag-shaped values', () => {
    expect(() => parseArgs([])).toThrow(CliUsageError);
    expect(() => parseArgs(['scaffold'])).toThrow(/unknown command/);
    expect(() => parseArgs(['init', '--force'])).toThrow(/unknown flag/);
    expect(() => parseArgs(['init', '--dir'])).toThrow(/requires a path/);
    expect(() => parseArgs(['init', '--dir', '--json'])).toThrow(/requires a path/);
  });
});

describe('init', () => {
  let dir: string;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it('scaffolds a repo that passes brickwall --full out of the box', () => {
    dir = mkdtempSync(join(tmpdir(), 'cortex-init-'));
    const report = init(dir);
    expect(report.created.length).toBeGreaterThanOrEqual(14);
    expect(report.skipped).toEqual([]);
    expect(report.notes).toEqual([]);
    const result = run({ cwd: dir, mode: 'full' });
    expect(result.violations).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('every scaffolded config parses', () => {
    dir = mkdtempSync(join(tmpdir(), 'cortex-init-'));
    init(dir);
    for (const json of ['brickwall.config.json', '.prettierrc.json', 'knip.json']) {
      expect(() =>
        JSON.parse(readFileSync(join(dir, json), 'utf-8')),
      ).not.toThrow();
    }
    const markdownlint = require(join(dir, '.markdownlint.cjs')) as object;
    expect(markdownlint).toHaveProperty('MD013');
  });

  it('drift guard: the scaffolded brickwall config IS the resolved defaults', () => {
    dir = mkdtempSync(join(tmpdir(), 'cortex-init-'));
    init(dir);
    const template = JSON.parse(
      readFileSync(join(dir, 'brickwall.config.json'), 'utf-8'),
    ) as unknown;
    expect(template).toEqual(DEFAULT_CONFIG);
  });

  it('never overwrites: a second init skips everything and changes nothing', () => {
    dir = mkdtempSync(join(tmpdir(), 'cortex-init-'));
    const first = init(dir);
    const marker = '# MINE NOW — the repo owns this file\n';
    writeFileSync(join(dir, '.ai/CONTEXT.md'), marker);
    const second = init(dir);
    expect(second.created).toEqual([]);
    expect(second.skipped.sort()).toEqual(first.created.sort());
    expect(readFileSync(join(dir, '.ai/CONTEXT.md'), 'utf-8')).toBe(marker);
  });

  it('pair-prints wiring gaps on partial adoption', () => {
    dir = mkdtempSync(join(tmpdir(), 'cortex-init-'));
    writeFileSync(join(dir, 'CLAUDE.md'), '# existing claude file\n');
    const report = init(dir);
    expect(report.skipped).toEqual(['CLAUDE.md']);
    expect(report.notes.some((n) => n.includes('CLAUDE.md points at AGENTS.md'))).toBe(
      true,
    );
    const text = formatReport(report, dir);
    expect(text).toContain('never overwritten');
    expect(text).toContain('Next steps');
  });
});
