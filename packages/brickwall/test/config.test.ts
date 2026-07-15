import { describe, expect, it } from 'vitest';
import {
  BrickwallConfigError,
  DEFAULT_CONFIG,
  validateAndMergeConfig,
} from '../src/config.js';

describe('validateAndMergeConfig', () => {
  it('returns defaults for undefined input', () => {
    expect(validateAndMergeConfig(undefined)).toEqual(DEFAULT_CONFIG);
  });

  it('returns defaults for null input', () => {
    expect(validateAndMergeConfig(null)).toEqual(DEFAULT_CONFIG);
  });

  it('merges partial budgets over defaults', () => {
    const config = validateAndMergeConfig({ budgets: { mdLines: 100 } });
    expect(config.budgets.mdLines).toBe(100);
    expect(config.budgets.mdFileCount).toBe(DEFAULT_CONFIG.budgets.mdFileCount);
    expect(config.budgets.storyLines).toBe(DEFAULT_CONFIG.budgets.storyLines);
    expect(config.budgets.codeLines).toBe(DEFAULT_CONFIG.budgets.codeLines);
  });

  it('overrides array fields wholesale, not merged', () => {
    const config = validateAndMergeConfig({ storyDirs: ['custom'] });
    expect(config.storyDirs).toEqual(['custom']);
  });

  it('overrides banEslintDisable', () => {
    const config = validateAndMergeConfig({ banEslintDisable: false });
    expect(config.banEslintDisable).toBe(false);
  });

  it('rejects a non-object root', () => {
    expect(() => validateAndMergeConfig('nope')).toThrow(/must be an object/);
    expect(() => validateAndMergeConfig(42)).toThrow(/must be an object/);
    expect(() => validateAndMergeConfig([1, 2])).toThrow(/must be an object/);
  });

  it('rejects unknown top-level keys', () => {
    expect(() => validateAndMergeConfig({ bogus: true })).toThrow(
      /unknown key "bogus"/,
    );
  });

  it('rejects unknown budgets keys', () => {
    expect(() => validateAndMergeConfig({ budgets: { bogus: 1 } })).toThrow(
      /unknown key "budgets.bogus"/,
    );
  });

  it('rejects a non-object budgets value', () => {
    expect(() => validateAndMergeConfig({ budgets: 'nope' })).toThrow(
      /"budgets" must be an object/,
    );
  });

  it('rejects non-positive budget numbers', () => {
    expect(() => validateAndMergeConfig({ budgets: { mdLines: 0 } })).toThrow(
      /positive number/,
    );
    expect(() => validateAndMergeConfig({ budgets: { mdLines: -5 } })).toThrow(
      /positive number/,
    );
    expect(() =>
      validateAndMergeConfig({ budgets: { mdLines: 'ten' } }),
    ).toThrow(/positive number/);
  });

  it('rejects non-string-array fields', () => {
    expect(() => validateAndMergeConfig({ storyDirs: 'docs' })).toThrow(
      /must be an array of strings/,
    );
    expect(() => validateAndMergeConfig({ storyDirs: [1, 2] })).toThrow(
      /must be an array of strings/,
    );
  });

  it('rejects a non-boolean banEslintDisable', () => {
    expect(() => validateAndMergeConfig({ banEslintDisable: 'yes' })).toThrow(
      /must be a boolean/,
    );
  });

  it('throws BrickwallConfigError (not a plain Error) on invalid input', () => {
    expect(() => validateAndMergeConfig({ bogus: true })).toThrow(
      BrickwallConfigError,
    );
  });

  it('defaults exemptFiles to ["CHANGELOG.md"]', () => {
    expect(DEFAULT_CONFIG.exemptFiles).toEqual(['CHANGELOG.md']);
  });

  it('overrides exemptFiles', () => {
    const config = validateAndMergeConfig({ exemptFiles: ['NOTES.md'] });
    expect(config.exemptFiles).toEqual(['NOTES.md']);
  });

  it('defaults ignoreDirs to include .changeset, .claude, and .github', () => {
    expect(DEFAULT_CONFIG.ignoreDirs).toEqual(
      expect.arrayContaining(['.changeset', '.claude', '.github']),
    );
  });

  it('accepts a plain number for budgets.codeLines', () => {
    const config = validateAndMergeConfig({ budgets: { codeLines: 300 } });
    expect(config.budgets.codeLines).toBe(300);
  });

  it('accepts a per-extension map for budgets.codeLines covering every codeExtension', () => {
    const config = validateAndMergeConfig({
      codeExtensions: ['.ts', '.scss'],
      budgets: { codeLines: { '.ts': 250, '.scss': 600 } },
    });
    expect(config.budgets.codeLines).toEqual({ '.ts': 250, '.scss': 600 });
  });

  it('rejects a codeLines map missing an entry for a configured extension', () => {
    expect(() =>
      validateAndMergeConfig({
        codeExtensions: ['.ts', '.scss'],
        budgets: { codeLines: { '.ts': 250 } },
      }),
    ).toThrow(/missing an entry/);
  });

  it('rejects a codeLines map with a non-positive value', () => {
    expect(() =>
      validateAndMergeConfig({ budgets: { codeLines: { '.ts': 0 } } }),
    ).toThrow(/positive number/);
  });

  it('rejects a codeLines value that is neither a number nor a map', () => {
    expect(() =>
      validateAndMergeConfig({ budgets: { codeLines: 'lots' } }),
    ).toThrow(/positive number or a map/);
  });
});
