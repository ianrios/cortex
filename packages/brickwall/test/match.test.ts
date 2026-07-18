import { describe, expect, it } from 'vitest';
import {
  classify,
  dirEntryMatch,
  matchesAnySubstring,
  matchSelector,
  normalizeDirEntry,
  normalizePattern,
  patternMatch,
  resolveTier,
} from '../src/match.js';

describe('normalizeDirEntry', () => {
  it('root-anchors leading-slash and slash-containing entries', () => {
    expect(normalizeDirEntry('/docs')).toEqual({ anchored: true, value: 'docs' });
    expect(normalizeDirEntry('docs/api')).toEqual({ anchored: true, value: 'docs/api' });
    expect(normalizeDirEntry('/docs/archive')).toEqual({ anchored: true, value: 'docs/archive' });
  });
  it('treats bare names as unanchored and strips trailing slashes/backslashes', () => {
    expect(normalizeDirEntry('docs')).toEqual({ anchored: false, value: 'docs' });
    expect(normalizeDirEntry('docs/')).toEqual({ anchored: false, value: 'docs' });
    expect(normalizeDirEntry('docs\\api')).toEqual({ anchored: true, value: 'docs/api' });
  });
});

describe('dirEntryMatch', () => {
  it('anchored entries match as root prefixes only', () => {
    expect(dirEntryMatch('docs/a.md', '/docs')).toBe(4);
    expect(dirEntryMatch('packages/x/docs/a.md', '/docs')).toBe(-1);
    expect(dirEntryMatch('docs/api/a.md', 'docs/api')).toBe(8);
  });
  it('bare names match as a segment at any depth, deepest occurrence wins', () => {
    expect(dirEntryMatch('docs/a.md', 'docs')).toBe(4);
    expect(dirEntryMatch('packages/x/docs/a.md', 'docs')).toBe(15);
    expect(dirEntryMatch('docs/a/docs/x.md', 'docs')).toBe(11);
  });
  it('never matches on the basename itself', () => {
    expect(dirEntryMatch('src/docs', 'docs')).toBe(-1);
  });
});

describe('patternMatch', () => {
  it('bare extension and starred forms are equivalent basename suffixes', () => {
    expect(normalizePattern('.scss')).toBe('.scss');
    expect(normalizePattern('*.scss')).toBe('.scss');
    expect(patternMatch('src/a.scss', '.scss')).toBe(true);
    expect(patternMatch('src/a.scss', '*.scss')).toBe(true);
    expect(patternMatch('src/a.scss.map', '.scss')).toBe(false);
  });
  it('is naive by design: suffixes catch longer basenames too', () => {
    expect(patternMatch('docs/API-README.md', 'README.md')).toBe(true);
    expect(patternMatch('x/y/README.md', 'README.md')).toBe(true);
  });
  it('compound suffixes distinguish *.storybook.py from *.py', () => {
    expect(patternMatch('a.storybook.py', '.storybook.py')).toBe(true);
    expect(patternMatch('a.py', '.storybook.py')).toBe(false);
    expect(patternMatch('a.storybook.py', '.py')).toBe(true);
  });
  it('lone * matches every basename', () => {
    expect(patternMatch('anything/at.all', '*')).toBe(true);
  });
});

describe('matchSelector', () => {
  it('ANDs dirs with patterns, ANY within each field', () => {
    const sel = { dirs: ['/src'], patterns: ['.scss', '.css'] };
    expect(matchSelector('src/a.css', sel).matched).toBe(true);
    expect(matchSelector('src/a.ts', sel).matched).toBe(false);
    expect(matchSelector('lib/a.scss', sel).matched).toBe(false);
  });
  it('reports dir specificity; -1 for patterns-only claims', () => {
    expect(matchSelector('src/a.ts', { patterns: ['.ts'] }).dirSpecificity).toBe(-1);
    expect(matchSelector('src/deep/a.ts', { dirs: ['src/deep'] }).dirSpecificity).toBe(8);
  });
});

describe('classify (cross-section precedence)', () => {
  const docsDefault = [{ patterns: ['.md'] }];
  const codeDefault = [{ patterns: ['.ts', '.tsx', '.js', '.jsx'] }];

  it('routes plainly-claimed files and leaves the rest unscanned', () => {
    expect(classify('a.md', docsDefault, codeDefault)).toBe('docs');
    expect(classify('a.ts', docsDefault, codeDefault)).toBe('code');
    expect(classify('a.png', docsDefault, codeDefault)).toBe('none');
  });
  it('a dirs claim beats a patterns-only claim (whole-docs-dir case)', () => {
    const docs = [{ dirs: ['/docs'] }, { patterns: ['.md'] }];
    expect(classify('docs/example.ts', docs, codeDefault)).toBe('docs');
    expect(classify('src/app.ts', docs, codeDefault)).toBe('code');
  });
  it('between two dirs claims the deeper matched prefix wins', () => {
    const docs = [{ dirs: ['/docs'] }];
    const code = [{ dirs: ['docs/generated'] }];
    expect(classify('docs/generated/a.ts', docs, code)).toBe('code');
    expect(classify('docs/a.ts', docs, code)).toBe('docs');
  });
  it('true ties are ambiguous', () => {
    expect(classify('a.ts', [{ patterns: ['.ts'] }], codeDefault)).toBe('ambiguous');
    expect(
      classify('docs/a.ts', [{ dirs: ['/docs'] }], [{ dirs: ['/docs'] }]),
    ).toBe('ambiguous');
  });
});

describe('resolveTier', () => {
  it('first matching tier in config order wins', () => {
    const tiers = [
      { dirs: ['src/legacy'], patterns: ['.scss'], maxLines: 600 },
      { patterns: ['.scss'], maxLines: 400 },
    ];
    expect(resolveTier('src/legacy/a.scss', tiers)?.maxLines).toBe(600);
    expect(resolveTier('src/other/a.scss', tiers)?.maxLines).toBe(400);
    expect(resolveTier('src/a.ts', tiers)).toBeUndefined();
  });
});

describe('matchesAnySubstring', () => {
  it('matches naive path substrings (test-file conventions)', () => {
    expect(matchesAnySubstring('src/a.test.ts', ['.test.', '.spec.'])).toBe(true);
    expect(matchesAnySubstring('src/__tests__/a.ts', ['__tests__/'])).toBe(true);
    expect(matchesAnySubstring('src/latest.ts', ['.test.'])).toBe(false);
  });
});
