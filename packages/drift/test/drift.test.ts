import { describe, expect, it, vi } from 'vitest';
import { formatChecks, runChecks } from '../src/index.js';

describe('runChecks', () => {
  it('runs every check in registry order and tags messages with the key', () => {
    const result = runChecks({
      'a-check': () => ['first', 'second'],
      'b-check': () => [],
      'c-check': () => ['third'],
    });
    expect(result.violations).toEqual([
      { type: 'a-check', message: 'first' },
      { type: 'a-check', message: 'second' },
      { type: 'c-check', message: 'third' },
    ]);
    expect(result.errors).toEqual([]);
  });

  it('checks are lazy: nothing runs until runChecks is called', () => {
    const spy = vi.fn(() => []);
    const registry = { lazy: spy };
    expect(spy).not.toHaveBeenCalled();
    runChecks(registry);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('a throwing check becomes an errors entry; later checks still run', () => {
    const result = runChecks({
      ok: () => ['fine'],
      boom: () => {
        throw new Error('parse failed');
      },
      after: () => ['still ran'],
    });
    expect(result.errors).toEqual([{ type: 'boom', error: 'parse failed' }]);
    expect(result.violations.map((v) => v.message)).toEqual([
      'fine',
      'still ran',
    ]);
  });

  it('stringifies non-Error throws', () => {
    const result = runChecks({
      weird: () => {
        // eslint parity: throwing non-Errors is bad form but must not crash the harness
        throw 'just a string';
      },
    });
    expect(result.errors).toEqual([{ type: 'weird', error: 'just a string' }]);
  });

  it('preserves the literal key union across the boundary', () => {
    const result = runChecks({
      'token-sync': () => [],
      'demo-missing': () => [],
    });
    // Compile-time pin: type is the literal union, not string.
    const t: 'token-sync' | 'demo-missing' | undefined =
      result.violations[0]?.type;
    expect(t).toBeUndefined();
    // @ts-expect-error — an eager string[] value must not compile.
    runChecks({ eager: ['already ran'] });
  });
});

describe('formatChecks', () => {
  const clean = { violations: [], errors: [] };
  const dirty = {
    violations: [{ type: 'token-sync', message: 'missing --x' }],
    errors: [],
  };
  const crashed = {
    violations: [{ type: 'token-sync', message: 'missing --x' }],
    errors: [{ type: 'demo-missing', error: 'ENOENT: no such file' }],
  };

  it('maps verdicts to exit codes: 0 clean, 1 dirty, 2 no-valid-verdict', () => {
    expect(formatChecks(clean).exitCode).toBe(0);
    expect(formatChecks(dirty).exitCode).toBe(1);
    // A crash outranks violations: nothing was fully checked.
    expect(formatChecks(crashed).exitCode).toBe(2);
  });

  it('json is the stable machine surface: { violations, errors } on stdout', () => {
    const out = formatChecks(crashed, { json: true });
    expect(out.stderr).toBeUndefined();
    expect(JSON.parse(out.stdout!)).toEqual({
      violations: crashed.violations,
      errors: crashed.errors,
    });
  });

  it('human output groups [type] lines on stderr and is absent from stdout', () => {
    const out = formatChecks(crashed);
    expect(out.stdout).toBeUndefined();
    expect(out.stderr).toContain('[token-sync] missing --x');
    expect(out.stderr).toContain('[demo-missing] ENOENT: no such file');
    expect(out.stderr).toContain('no valid verdict');
    expect(formatChecks(clean).stderr).toContain('✅');
  });
});
