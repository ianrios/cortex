import { describe, expect, it } from 'vitest';
import { CliUsageError, formatResult, parseArgs } from '../src/cli.js';
import type { Violation } from '../src/checks.js';

describe('parseArgs', () => {
  it('parses no flags', () => {
    expect(parseArgs([])).toEqual({ json: false, configPath: undefined });
  });

  it('parses --json', () => {
    expect(parseArgs(['--json'])).toEqual({ json: true, configPath: undefined });
  });

  it('parses --config <path>', () => {
    expect(parseArgs(['--config', 'foo.json'])).toEqual({
      json: false,
      configPath: 'foo.json',
    });
  });

  it('parses --json and --config together, order-independent', () => {
    expect(parseArgs(['--config', 'foo.json', '--json'])).toEqual({
      json: true,
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

  // --json is the stable machine surface: assert the exact bytes.
  it('produces exact JSON output for a clean run', () => {
    expect(formatResult([], true)).toEqual({
      exitCode: 0,
      stdout: '[]\n',
    });
  });

  it('produces exact JSON output for violations', () => {
    expect(formatResult(violations, true)).toEqual({
      exitCode: 1,
      stdout: `${JSON.stringify(violations)}\n`,
    });
  });

  // Human-readable format stays free to change wording/layout; assert loosely.
  it('exits 0 with a passing message for a clean run (human)', () => {
    const result = formatResult([], false);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toMatch(/within limits/);
  });

  it('exits 1 and lists every violation grouped by type (human)', () => {
    const result = formatResult(violations, false);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('[md-count]');
    expect(result.stderr).toContain('[code-size]');
    expect(result.stderr).toContain('Too many .md files');
    expect((result.stderr?.match(/\n/g) ?? []).length).toBeGreaterThan(0);
  });
});
