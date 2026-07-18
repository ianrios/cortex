import { describe, expect, it } from 'vitest';
import { CliUsageError, formatResult, parseArgs } from '../src/cli.js';

describe('parseArgs', () => {
  it('defaults to diff mode with no flags', () => {
    expect(parseArgs([])).toEqual({
      json: false,
      mode: 'diff',
      base: undefined,
      configPath: undefined,
    });
  });

  it('parses --full, --audit, --json, --base, --config', () => {
    expect(parseArgs(['--full']).mode).toBe('full');
    expect(parseArgs(['--audit']).mode).toBe('audit');
    expect(parseArgs(['--json']).json).toBe(true);
    expect(parseArgs(['--base', 'origin/main']).base).toBe('origin/main');
    expect(parseArgs(['--config', 'x.json']).configPath).toBe('x.json');
  });

  it('rejects unknown flags, missing values, and bad combinations', () => {
    expect(() => parseArgs(['--all'])).toThrow(CliUsageError);
    expect(() => parseArgs(['--base'])).toThrow(/requires a git ref/);
    expect(() => parseArgs(['--base', '--json'])).toThrow(/requires a git ref/);
    expect(() => parseArgs(['--config'])).toThrow(/requires a path/);
    expect(() => parseArgs(['--full', '--audit'])).toThrow(/mutually exclusive/);
    expect(() => parseArgs(['--full', '--base', 'main'])).toThrow(/diff mode/);
  });
});

describe('formatResult', () => {
  const clean = { violations: [], warnings: [], mode: 'diff' as const };
  const violating = {
    violations: [{ type: 'doc-size' as const, message: 'a.md: 9 lines (max 2)', file: 'a.md' }],
    warnings: [{ type: 'stale-tier' as const, message: 'docs.tiers[0] matches no scanned file' }],
    mode: 'full' as const,
  };

  it('exit 0 when clean, 1 on violations; warnings never affect the code', () => {
    expect(formatResult(clean, { json: false }).exitCode).toBe(0);
    expect(formatResult(violating, { json: false }).exitCode).toBe(1);
    expect(
      formatResult({ ...clean, warnings: violating.warnings }, { json: false }).exitCode,
    ).toBe(0);
  });

  it('--json is the stable machine surface: { violations, warnings, mode }', () => {
    const output = formatResult(violating, { json: true });
    expect(output.stdout).toBeDefined();
    expect(JSON.parse(output.stdout!)).toEqual({
      violations: violating.violations,
      warnings: violating.warnings,
      mode: 'full',
    });
  });

  it('human output groups violations and warnings on stderr', () => {
    const output = formatResult(violating, { json: false });
    expect(output.stderr).toContain('[doc-size] a.md: 9 lines (max 2)');
    expect(output.stderr).toContain('[stale-tier]');
    expect(output.stderr).toContain('❌');
  });

  it('surfaces the audit header and the diff-fallback note', () => {
    const audit = formatResult({ ...clean, mode: 'audit' as const }, { json: false });
    expect(audit.stderr).toContain('--audit');
    const fallback = formatResult(
      { ...clean, mode: 'full' as const, note: 'ran --full instead' },
      { json: false },
    );
    expect(fallback.stderr).toContain('ran --full instead');
    const jsonFallback = formatResult(
      { ...clean, mode: 'full' as const, note: 'ran --full instead' },
      { json: true },
    );
    expect(jsonFallback.stderr).toContain('ran --full instead');
    expect(JSON.parse(jsonFallback.stdout!).mode).toBe('full');
  });
});
