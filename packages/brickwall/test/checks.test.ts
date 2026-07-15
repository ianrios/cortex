import { describe, expect, it } from 'vitest';
import {
  checkCodeSize,
  checkDocSize,
  checkEslintDisable,
  checkMdCount,
  countLines,
  isExempt,
  isExemptFile,
  isTestFile,
  resolveCodeLimit,
  resolveDocTier,
} from '../src/checks.js';

describe('countLines', () => {
  it('does not count a trailing final newline as an extra line', () => {
    expect(countLines('a\nb\nc\n')).toBe(3);
    expect(countLines('a\nb\nc')).toBe(3);
  });

  it('handles an empty string', () => {
    expect(countLines('')).toBe(1);
  });

  it('handles a single line without newline', () => {
    expect(countLines('one line')).toBe(1);
  });

  it('handles multiple trailing newlines', () => {
    expect(countLines('a\nb\n\n')).toBe(3);
  });
});

describe('isExempt / resolveDocTier (tier resolution)', () => {
  const storyDirs = ['.ai/plans', '.ai/specs', 'docs'];
  const exemptDirs = ['.ai/completed', 'docs/archive'];

  it('recognizes exempt files under an exempt dir', () => {
    expect(isExempt('.ai/completed/foo.md', exemptDirs)).toBe(true);
    expect(isExempt('docs/archive/old.md', exemptDirs)).toBe(true);
  });

  it('does not exempt files merely prefixed by the dir name', () => {
    expect(isExempt('docs/archived-notes.md', exemptDirs)).toBe(false);
    expect(isExempt('.ai/completedish.md', exemptDirs)).toBe(false);
  });

  it('resolves story tier for files under storyDirs', () => {
    expect(resolveDocTier('docs/EXTRACTION_PLAN.md', storyDirs)).toBe('story');
    expect(resolveDocTier('.ai/plans/phase1.md', storyDirs)).toBe('story');
  });

  it('resolves default tier for files outside storyDirs', () => {
    expect(resolveDocTier('README.md', storyDirs)).toBe('default');
    expect(resolveDocTier('.ai/RULES.md', storyDirs)).toBe('default');
  });

  it('normalizes backslash-form config dirs to posix before comparing', () => {
    expect(isExempt('docs/archive/old.md', ['docs\\archive'])).toBe(true);
    expect(resolveDocTier('docs/plan.md', ['docs\\'])).toBe('story');
  });
});

describe('isExemptFile', () => {
  it('matches by exact relative path', () => {
    expect(isExemptFile('CHANGELOG.md', ['CHANGELOG.md'])).toBe(true);
  });

  it('matches by basename at any depth', () => {
    expect(isExemptFile('packages/brickwall/CHANGELOG.md', ['CHANGELOG.md'])).toBe(
      true,
    );
  });

  it('does not match unrelated files', () => {
    expect(isExemptFile('README.md', ['CHANGELOG.md'])).toBe(false);
  });
});

describe('isTestFile', () => {
  it('matches .test. and .spec. files', () => {
    expect(isTestFile('src/foo.test.ts')).toBe(true);
    expect(isTestFile('src/foo.spec.tsx')).toBe(true);
  });

  it('does not match ordinary files', () => {
    expect(isTestFile('src/foo.ts')).toBe(false);
    expect(isTestFile('src/testing.ts')).toBe(false);
  });
});

describe('resolveCodeLimit', () => {
  it('applies a plain number to every file', () => {
    expect(resolveCodeLimit('src/a.ts', 250)).toBe(250);
    expect(resolveCodeLimit('src/a.scss', 250)).toBe(250);
  });

  it('looks up the extension in a per-extension map', () => {
    const map = { '.ts': 250, '.scss': 600 };
    expect(resolveCodeLimit('src/a.ts', map)).toBe(250);
    expect(resolveCodeLimit('src/a.scss', map)).toBe(600);
  });

  it('throws when the extension is missing from the map', () => {
    expect(() => resolveCodeLimit('src/a.jsx', { '.ts': 250 })).toThrow(
      /no code-size budget/,
    );
  });
});

describe('checkMdCount', () => {
  it('passes exactly at the limit', () => {
    const files = Array.from({ length: 5 }, (_, i) => `f${i}.md`);
    expect(checkMdCount(files, [], [], 5)).toEqual([]);
  });

  it('fails one over the limit', () => {
    const files = Array.from({ length: 6 }, (_, i) => `f${i}.md`);
    const violations = checkMdCount(files, [], [], 5);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe('md-count');
  });

  it('excludes exempt-dir files from the count', () => {
    const files = ['a.md', 'b.md', '.ai/completed/c.md', '.ai/completed/d.md'];
    expect(checkMdCount(files, ['.ai/completed'], [], 2)).toEqual([]);
  });

  it('excludes exempt files (e.g. CHANGELOG.md) from the count', () => {
    const files = ['a.md', 'b.md', 'CHANGELOG.md'];
    expect(checkMdCount(files, [], ['CHANGELOG.md'], 2)).toEqual([]);
  });
});

describe('checkDocSize', () => {
  const budgets = { mdLines: 3, storyLines: 5 };

  function makeContent(lines: number): string {
    return Array.from({ length: lines }, (_, i) => `line ${i}`).join('\n');
  }

  it('passes exactly at the default-tier limit', () => {
    const files = [{ path: 'README.md', content: makeContent(3) }];
    expect(checkDocSize(files, [], [], [], budgets)).toEqual([]);
  });

  it('fails one over the default-tier limit', () => {
    const files = [{ path: 'README.md', content: makeContent(4) }];
    const violations = checkDocSize(files, [], [], [], budgets);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe('doc-size');
  });

  it('passes exactly at the story-tier limit', () => {
    const files = [{ path: 'docs/plan.md', content: makeContent(5) }];
    expect(checkDocSize(files, ['docs'], [], [], budgets)).toEqual([]);
  });

  it('fails one over the story-tier limit', () => {
    const files = [{ path: 'docs/plan.md', content: makeContent(6) }];
    const violations = checkDocSize(files, ['docs'], [], [], budgets);
    expect(violations).toHaveLength(1);
  });

  it('skips exempt-dir files entirely, even over budget', () => {
    const files = [{ path: 'docs/archive/huge.md', content: makeContent(999) }];
    expect(checkDocSize(files, ['docs'], ['docs/archive'], [], budgets)).toEqual([]);
  });

  it('skips exempt files (e.g. CHANGELOG.md) entirely, even over budget', () => {
    const files = [{ path: 'CHANGELOG.md', content: makeContent(999) }];
    expect(checkDocSize(files, [], [], ['CHANGELOG.md'], budgets)).toEqual([]);
  });
});

describe('checkCodeSize', () => {
  function makeContent(lines: number): string {
    return Array.from({ length: lines }, (_, i) => `const x${i} = ${i};`).join(
      '\n',
    );
  }

  it('passes exactly at the limit', () => {
    const files = [{ path: 'src/a.ts', content: makeContent(10) }];
    expect(checkCodeSize(files, [], 10)).toEqual([]);
  });

  it('fails one over the limit', () => {
    const files = [{ path: 'src/a.ts', content: makeContent(11) }];
    const violations = checkCodeSize(files, [], 10);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe('code-size');
  });

  it('exempts test files', () => {
    const files = [{ path: 'src/a.test.ts', content: makeContent(999) }];
    expect(checkCodeSize(files, [], 10)).toEqual([]);
  });

  it('exempts files under exemptDirs', () => {
    const files = [{ path: 'vendor/big.ts', content: makeContent(999) }];
    expect(checkCodeSize(files, ['vendor'], 10)).toEqual([]);
  });

  it('applies a per-extension budget map', () => {
    const files = [
      { path: 'src/a.ts', content: makeContent(10) },
      { path: 'src/a.scss', content: makeContent(20) },
    ];
    const map = { '.ts': 10, '.scss': 20 };
    expect(checkCodeSize(files, [], map)).toEqual([]);
    const violations = checkCodeSize(
      [{ path: 'src/a.scss', content: makeContent(21) }],
      [],
      map,
    );
    expect(violations).toHaveLength(1);
  });
});

describe('checkEslintDisable', () => {
  it('matches // form', () => {
    const files = [{ path: 'src/a.ts', content: '// eslint-disable-next-line' }];
    const violations = checkEslintDisable(files, []);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe('eslint-disable');
  });

  it('matches /* */ form', () => {
    const files = [{ path: 'src/a.ts', content: '/* eslint-disable */' }];
    expect(checkEslintDisable(files, [])).toHaveLength(1);
  });

  it('does not match ordinary code', () => {
    const files = [{ path: 'src/a.ts', content: 'const x = 1;' }];
    expect(checkEslintDisable(files, [])).toEqual([]);
  });

  it('flags prose comments too — a deliberate, source-matching false positive', () => {
    const files = [
      { path: 'src/a.ts', content: '// eslint-disable is banned here' },
    ];
    expect(checkEslintDisable(files, [])).toHaveLength(1);
  });

  it('reports the correct line number', () => {
    const files = [
      { path: 'src/a.ts', content: 'const x = 1;\n// eslint-disable-line' },
    ];
    const violations = checkEslintDisable(files, []);
    expect(violations[0]?.message).toContain('src/a.ts:2');
  });

  it('skips exempt files', () => {
    const files = [
      { path: 'vendor/a.ts', content: '// eslint-disable-next-line' },
    ];
    expect(checkEslintDisable(files, ['vendor'])).toEqual([]);
  });
});
