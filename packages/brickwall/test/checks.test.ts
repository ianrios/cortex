import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  checkBannedPragmas,
  checkCodeSize,
  checkDocCount,
  checkDocSize,
  checkExemptionDebt,
  checkStaleTiers,
  countLines,
  isArchived,
  isExemptFile,
  isTestFile,
} from '../src/checks.js';
import { DEFAULT_CONFIG } from '../src/config.js';

// Pragma-bearing test DATA lives in fixture files, never inline in source
// (the scan runs on this repo's own tests). The pragma VALUE comes from the
// defaults JSON for the same reason.
const PRAGMA = DEFAULT_CONFIG.bannedPragmas[0]!;
const pragmaSample = readFileSync(
  new URL('./fixtures/pragmas/sample-code.txt', import.meta.url),
  'utf-8',
);

describe('countLines', () => {
  it('does not count a trailing newline as an extra line', () => {
    expect(countLines('a\nb\n')).toBe(2);
    expect(countLines('a\nb')).toBe(2);
    // Edge behaviors every budget check depends on — do not "simplify" away:
    // an empty file is one (empty) line; blank lines count.
    expect(countLines('')).toBe(1);
    expect(countLines('a\nb\n\n')).toBe(3);
  });
});

describe('isArchived', () => {
  it('uses the one dir grammar: slash entries root-anchor, bare names any depth', () => {
    expect(isArchived('.ai/completed/x.md', ['.ai/completed'])).toBe(true);
    expect(isArchived('sub/.ai/completed/x.md', ['.ai/completed'])).toBe(false);
    expect(isArchived('sub/archive/x.md', ['archive'])).toBe(true);
    expect(isArchived('docs/x.md', ['/docs'])).toBe(true);
    expect(isArchived('packages/a/docs/x.md', ['/docs'])).toBe(false);
  });
});

describe('isExemptFile', () => {
  it('matches by exact relative path or basename', () => {
    expect(isExemptFile('CHANGELOG.md', ['CHANGELOG.md'])).toBe(true);
    expect(isExemptFile('packages/x/CHANGELOG.md', ['CHANGELOG.md'])).toBe(true);
    expect(isExemptFile('src/data.ts', ['src/data.ts'])).toBe(true);
    expect(isExemptFile('other/data.ts', ['src/data.ts'])).toBe(false);
  });
});

describe('isTestFile', () => {
  it('is configurable naive substring matching', () => {
    expect(isTestFile('src/a.test.ts', ['.test.', '.spec.'])).toBe(true);
    expect(isTestFile('tests/test_walk.py', ['test_'])).toBe(true);
    expect(isTestFile('src/a.ts', ['.test.'])).toBe(false);
  });
});

describe('checkDocCount', () => {
  it('flags only when over the limit', () => {
    expect(checkDocCount(['a.md', 'b.md'], 2)).toEqual([]);
    const violations = checkDocCount(['a.md', 'b.md', 'c.md'], 2);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ type: 'doc-count' });
    expect(violations[0]!.message).toContain('3 (max 2)');
  });
});

describe('checkDocSize / checkCodeSize with tiers', () => {
  const tiers = [{ dirs: ['.ai/plans'], maxLines: 5 }];

  it('applies the first matching tier, else the section default', () => {
    const files = [
      { path: '.ai/plans/p.md', content: 'x\n'.repeat(4) },
      { path: 'README.md', content: 'x\n'.repeat(4) },
    ];
    const violations = checkDocSize(files, tiers, 2);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ type: 'doc-size', file: 'README.md' });
    expect(violations[0]!.message).toContain('(max 2)');
  });

  it('code: test files skip the size cap only', () => {
    const files = [
      { path: 'src/big.test.ts', content: 'x\n'.repeat(10) },
      { path: 'src/big.ts', content: 'x\n'.repeat(10) },
    ];
    const violations = checkCodeSize(files, [], 3, ['.test.']);
    expect(violations).toHaveLength(1);
    expect(violations[0]!.file).toBe('src/big.ts');
  });

  it('code tiers: scss 600 over ts 250 (the portfolio case)', () => {
    const scssTiers = [{ patterns: ['.scss'], maxLines: 3 }];
    const files = [
      { path: 'src/a.scss', content: 'x\n'.repeat(2) },
      { path: 'src/b.ts', content: 'x\n'.repeat(2) },
    ];
    expect(checkCodeSize(files, scssTiers, 1, [])).toMatchObject([
      { type: 'code-size', file: 'src/b.ts' },
    ]);
  });
});

describe('checkBannedPragmas', () => {
  it('flags every line containing a banned substring, tests included', () => {
    const files = [
      { path: 'src/a.test.ts', content: pragmaSample },
      { path: 'src/clean.ts', content: 'const ok = 1;\n' },
    ];
    const violations = checkBannedPragmas(files, [PRAGMA]);
    expect(violations).toHaveLength(2);
    expect(violations[0]).toMatchObject({ type: 'banned-pragma', file: 'src/a.test.ts' });
    expect(violations[0]!.message).toContain(':2 -');
    expect(violations[1]!.message).toContain(':3 -');
  });

  it('an empty pragma list visibly disables the scan', () => {
    expect(
      checkBannedPragmas([{ path: 'a.ts', content: pragmaSample }], []),
    ).toEqual([]);
  });
});

describe('checkExemptionDebt', () => {
  it('warns debt for matching custom entries, stale for dead ones, silent for defaults', () => {
    const warnings = checkExemptionDebt(
      ['src/data.ts', 'CHANGELOG.md'],
      ['src/data.ts', 'gone.ts', 'CHANGELOG.md'],
      ['CHANGELOG.md'],
    );
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toMatchObject({ type: 'exemption-debt' });
    expect(warnings[0]!.message).toContain('src/data.ts');
    expect(warnings[1]).toMatchObject({ type: 'stale-exemption' });
    expect(warnings[1]!.message).toContain('gone.ts');
  });
});

describe('checkStaleTiers', () => {
  it('warns for custom tiers matching nothing, including fully-shadowed ones', () => {
    const tiers = [
      { patterns: ['.scss'], maxLines: 600 },
      { dirs: ['src'], patterns: ['.scss'], maxLines: 300 },
    ];
    // The dir-scoped tier is listed AFTER the broad one, so it can never win.
    const warnings = checkStaleTiers('code', tiers, ['src/a.scss'], []);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({ type: 'stale-tier' });
    expect(warnings[0]!.message).toContain('code.tiers[1]');
  });

  it('default tiers stay silent even when they match nothing', () => {
    const warnings = checkStaleTiers(
      'docs',
      DEFAULT_CONFIG.docs.tiers,
      ['README.md'],
      DEFAULT_CONFIG.docs.tiers,
    );
    expect(warnings).toEqual([]);
  });
});
