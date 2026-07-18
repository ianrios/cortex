import { describe, expect, it } from 'vitest';
import {
  BrickwallConfigError,
  DEFAULT_CONFIG,
  validateAndMergeConfig,
} from '../src/config.js';

describe('validateAndMergeConfig', () => {
  it('returns full defaults for undefined/null', () => {
    expect(validateAndMergeConfig(undefined)).toEqual(DEFAULT_CONFIG);
    expect(validateAndMergeConfig(null)).toEqual(DEFAULT_CONFIG);
  });

  it('default pragma values come from the JSON data file, not source', () => {
    expect(DEFAULT_CONFIG.bannedPragmas).toHaveLength(1);
    expect(DEFAULT_CONFIG.bannedPragmas[0]).toContain('eslint');
  });

  it('rejects unknown keys at every level (old configs fail loudly)', () => {
    expect(() => validateAndMergeConfig({ storyDirs: [] })).toThrow(BrickwallConfigError);
    expect(() => validateAndMergeConfig({ budgets: {} })).toThrow(BrickwallConfigError);
    expect(() => validateAndMergeConfig({ docs: { maxWords: 1 } })).toThrow(/docs.maxWords/);
    expect(() =>
      validateAndMergeConfig({ docs: { matches: [{ globs: [] }] } }),
    ).toThrow(/docs.matches\[0\].globs/);
    expect(() =>
      validateAndMergeConfig({ docs: { tiers: [{ patterns: ['.md'], max: 1 }] } }),
    ).toThrow(/docs.tiers\[0\].max/);
  });

  it('merges groups per key over defaults', () => {
    const config = validateAndMergeConfig({ docs: { maxLines: 120 } });
    expect(config.docs.maxLines).toBe(120);
    expect(config.docs.maxCount).toBe(DEFAULT_CONFIG.docs.maxCount);
    expect(config.docs.tiers).toEqual(DEFAULT_CONFIG.docs.tiers);
    expect(config.code).toEqual(DEFAULT_CONFIG.code);
  });

  it('arrays replace defaults wholesale', () => {
    const config = validateAndMergeConfig({
      docs: { tiers: [] },
      ignoreDirs: ['node_modules'],
    });
    expect(config.docs.tiers).toEqual([]);
    expect(config.ignoreDirs).toEqual(['node_modules']);
  });

  it('rejects empty matches — a silent section disable', () => {
    expect(() => validateAndMergeConfig({ docs: { matches: [] } })).toThrow(/non-empty/);
  });

  it('rejects a selector with neither dirs nor patterns', () => {
    expect(() => validateAndMergeConfig({ code: { matches: [{}] } })).toThrow(
      /at least one/,
    );
  });

  it('rejects empty selector fields — present-but-unmatchable is a silent disable', () => {
    expect(() =>
      validateAndMergeConfig({ docs: { matches: [{ dirs: [], patterns: ['.md'] }] } }),
    ).toThrow(/must not be an empty array/);
    expect(() =>
      validateAndMergeConfig({ code: { tiers: [{ patterns: [], maxLines: 5 }] } }),
    ).toThrow(/must not be an empty array/);
  });

  it('rejects glob-shaped patterns that could never match a basename', () => {
    // A normalized suffix containing / or * is impossible; literal-char
    // oddities like "*.{ts,tsx}" stay legal (braces are filename chars).
    for (const pattern of ['**/*.md', 'src/*.ts']) {
      expect(() =>
        validateAndMergeConfig({ docs: { matches: [{ patterns: [pattern] }] } }),
      ).toThrow(/not a basename suffix/);
    }
  });

  it('rejects duplicate patterns after normalization within one selector', () => {
    expect(() =>
      validateAndMergeConfig({
        code: { matches: [{ patterns: ['.scss', '*.scss'] }] },
      }),
    ).toThrow(/duplicate/);
  });

  it('rejects identical selectors within one matches list', () => {
    expect(() =>
      validateAndMergeConfig({
        docs: { matches: [{ patterns: ['.md'] }, { patterns: ['*.md'] }] },
      }),
    ).toThrow(/duplicates an earlier selector/);
  });

  it('rejects duplicate tier selectors and requires positive maxLines', () => {
    expect(() =>
      validateAndMergeConfig({
        code: {
          tiers: [
            { patterns: ['.scss'], maxLines: 600 },
            { patterns: ['*.scss'], maxLines: 300 },
          ],
        },
      }),
    ).toThrow(/duplicates an earlier tier/);
    expect(() =>
      validateAndMergeConfig({ code: { tiers: [{ patterns: ['.scss'] }] } }),
    ).toThrow(/maxLines/);
    expect(() =>
      validateAndMergeConfig({ code: { tiers: [{ patterns: ['.scss'], maxLines: 0 }] } }),
    ).toThrow(/positive/);
  });

  it('accepts the portfolio-style multiband config (scss 600 over ts 250)', () => {
    const config = validateAndMergeConfig({
      code: {
        matches: [{ patterns: ['.ts', '.tsx', '.js', '.jsx', '.scss'] }],
        maxLines: 250,
        tiers: [{ patterns: ['.scss'], maxLines: 600 }],
      },
    });
    expect(config.code.tiers[0]?.maxLines).toBe(600);
    expect(config.code.maxLines).toBe(250);
  });

  it('bannedPragmas may be [] (visible disable) but never non-strings', () => {
    expect(validateAndMergeConfig({ bannedPragmas: [] }).bannedPragmas).toEqual([]);
    expect(() => validateAndMergeConfig({ bannedPragmas: [1] })).toThrow(
      BrickwallConfigError,
    );
    expect(() => validateAndMergeConfig({ bannedPragmas: [''] })).toThrow(
      BrickwallConfigError,
    );
  });

  it('validates numbers and string arrays', () => {
    expect(() => validateAndMergeConfig({ docs: { maxCount: -1 } })).toThrow(/positive/);
    expect(() => validateAndMergeConfig({ archiveDirs: 'docs' })).toThrow(/array/);
    expect(() => validateAndMergeConfig({ code: { testFilePatterns: [2] } })).toThrow(
      /array of non-empty strings/,
    );
  });
});
