import { describe, expect, it } from 'vitest';
import { CliUsageError, formatResult, parseArgs } from '../src/cli.js';
import type { Violation, Warning } from '../src/checks.js';

describe('parseArgs', () => {
  it('parses no flags', () => {
    expect(parseArgs([])).toEqual({
      json: false,
      all: false,
      configPath: undefined,
    });
  });

  it('parses --json', () => {
    expect(parseArgs(['--json'])).toEqual({
      json: true,
      all: false,
      configPath: undefined,
    });
  });

  it('parses --all alone', () => {
    expect(parseArgs(['--all'])).toEqual({
      json: false,
      all: true,
      configPath: undefined,
    });
  });

  it('parses --all combined with --json and --config, order-independent', () => {
    expect(parseArgs(['--json', '--all'])).toEqual({
      json: true,
      all: true,
      configPath: undefined,
    });
    expect(parseArgs(['--all', '--config', 'foo.json'])).toEqual({
      json: false,
      all: true,
      configPath: 'foo.json',
    });
  });

  it('parses --config <path>', () => {
    expect(parseArgs(['--config', 'foo.json'])).toEqual({
      json: false,
      all: false,
      configPath: 'foo.json',
    });
  });

  it('parses --json and --config together, order-independent', () => {
    expect(parseArgs(['--config', 'foo.json', '--json'])).toEqual({
      json: true,
      all: false,
      configPath: 'foo.json',
    });
  });

  it('throws CliUsageError for an unknown flag', () => {
    expect(() => parseArgs(['--bogus'])).toThrow(CliUsageError);
  });

  it('throws CliUsageError when --config is missing its value', () => {
    expect(() => parseArgs(['--config'])).toThrow(CliUsageError);
  });
});

describe('formatResult', () => {
  const violations: Violation[] = [
    { type: 'md-count', message: 'Too many .md files: 26 (max 25)' },
    { type: 'code-size', message: 'src/a.ts: 300 lines (max 250)', file: 'src/a.ts' },
  ];
  const warnings: Warning[] = [
    { type: 'exemption-debt', message: 'exemptFiles "data.ts" exempts 1 file(s): src/data.ts' },
    { type: 'stale-exemption', message: 'exemptFiles "ghost.md" matches no scanned file' },
  ];

  // --json is the stable machine surface: assert the exact bytes for all
  // three states — shape and ordering locked.
  it('produces exact JSON output for a clean, warning-free run', () => {
    const result = formatResult(
      { violations: [], warnings: [] },
      { json: true, all: false },
    );
    expect(result).toEqual({
      exitCode: 0,
      stdout: '{"violations":[],"warnings":[]}\n',
    });
  });

  it('produces exact JSON output for a clean run WITH warnings — still exit 0', () => {
    const result = formatResult(
      { violations: [], warnings },
      { json: true, all: false },
    );
    expect(result).toEqual({
      exitCode: 0,
      stdout: `${JSON.stringify({ violations: [], warnings })}\n`,
    });
  });

  it('produces exact JSON output for violations plus warnings', () => {
    const result = formatResult(
      { violations, warnings },
      { json: true, all: false },
    );
    expect(result).toEqual({
      exitCode: 1,
      stdout: `${JSON.stringify({ violations, warnings })}\n`,
    });
  });

  // Human-readable format stays free to change wording/layout; assert loosely.
  it('exits 0 with a passing message for a clean run (human)', () => {
    const result = formatResult(
      { violations: [], warnings: [] },
      { json: false, all: false },
    );
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toMatch(/within limits/);
    expect(result.stderr).not.toContain('⚠');
  });

  it('exits 1 and lists every violation grouped by type (human)', () => {
    const result = formatResult(
      { violations, warnings: [] },
      { json: false, all: false },
    );
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('[md-count]');
    expect(result.stderr).toContain('[code-size]');
    expect(result.stderr).toContain('Too many .md files');
    expect((result.stderr?.match(/\n/g) ?? []).length).toBeGreaterThan(0);
  });

  it('prints a ⚠ block after the verdict without changing the exit code (human)', () => {
    const result = formatResult(
      { violations: [], warnings },
      { json: false, all: false },
    );
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain('⚠');
    expect(result.stderr).toContain('[exemption-debt]');
    expect(result.stderr).toContain('[stale-exemption]');
    expect(result.stderr?.indexOf('⚠')).toBeGreaterThan(
      result.stderr?.indexOf('within limits') ?? 0,
    );
  });

  it('notes the full-scope audit in the human header under --all', () => {
    const result = formatResult(
      { violations: [], warnings: [] },
      { json: false, all: true },
    );
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toMatch(/full-scope audit/);
  });
});
