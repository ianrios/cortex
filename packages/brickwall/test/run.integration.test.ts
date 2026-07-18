import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { run } from '../src/run.js';
import { BrickwallConfigError } from '../src/config.js';

const fixture = (name: string): string =>
  join(new URL('./fixtures', import.meta.url).pathname, name);

// Fixture dirs sit inside the cortex git repo, so diff mode WORKS there and
// is nondeterministic (depends on the developer's working tree). Fixture
// assertions therefore pin mode: 'full' / 'audit'; diff semantics are
// tested in disposable git repos below.

describe('run — full mode on fixture repos', () => {
  it('clean fixture passes with no warnings', () => {
    const result = run({ cwd: fixture('clean'), mode: 'full' });
    expect(result.violations).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.mode).toBe('full');
  });

  it('violating fixture reports every violation type', () => {
    const result = run({ cwd: fixture('violating'), mode: 'full' });
    const types = result.violations.map((v) => v.type).sort();
    expect(types).toEqual(['banned-pragma', 'code-size', 'doc-count', 'doc-size']);
    const pragma = result.violations.find((v) => v.type === 'banned-pragma');
    expect(pragma?.file).toBe('src/bad.ts');
    expect(pragma?.message).toContain('src/bad.ts:1');
  });

  it('dirclaim fixture: a dirs claim beats the default code patterns', () => {
    const result = run({ cwd: fixture('dirclaim'), mode: 'full' });
    // docs/example.ts (3 lines) is claimed as a DOC (maxLines 2, tiers []).
    const docSize = result.violations.filter((v) => v.type === 'doc-size');
    expect(docSize).toHaveLength(1);
    expect(docSize[0]?.file).toBe('docs/example.ts');
    // src/app.ts stays code and passes.
    expect(result.violations.some((v) => v.file === 'src/app.ts')).toBe(false);
  });

  it('ambiguous fixture throws a loud per-file config error', () => {
    expect(() => run({ cwd: fixture('ambiguous'), mode: 'full' })).toThrow(
      BrickwallConfigError,
    );
    expect(() => run({ cwd: fixture('ambiguous'), mode: 'full' })).toThrow(/x\.ts/);
  });
});

describe('run — audit mode', () => {
  it('sees docs hidden in ignored dirs (shields off)', () => {
    const full = run({ cwd: fixture('all-mode'), mode: 'full' });
    expect(full.violations).toEqual([]);
    const audit = run({ cwd: fixture('all-mode'), mode: 'audit' });
    expect(audit.mode).toBe('audit');
    expect(
      audit.violations.some(
        (v) => v.type === 'doc-size' && v.file === 'hidden/big.md',
      ),
    ).toBe(true);
  });
});

describe('run — diff mode in a real git repo', () => {
  let dir: string;

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  const git = (cwd: string, ...args: string[]): void => {
    execFileSync(
      'git',
      ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args],
      { cwd, stdio: 'ignore' },
    );
  };

  function makeRepo(): string {
    const repo = mkdtempSync(join(tmpdir(), 'brickwall-diff-'));
    git(repo, 'init', '-q');
    writeFileSync(
      join(repo, 'brickwall.config.json'),
      JSON.stringify({ docs: { maxLines: 2, tiers: [] } }),
    );
    // Committed and OVER budget: full mode must flag it, diff mode must not.
    writeFileSync(join(repo, 'old.md'), 'a\nb\nc\nd\n');
    git(repo, 'add', '.');
    git(repo, 'commit', '-q', '-m', 'base');
    return repo;
  }

  it('checks only changed/untracked content; unchanged violations stay silent', () => {
    dir = makeRepo();
    const before = run({ cwd: dir });
    expect(before.mode).toBe('diff');
    expect(before.violations).toEqual([]);

    writeFileSync(join(dir, 'new.md'), '1\n2\n3\n4\n5\n');
    const after = run({ cwd: dir });
    expect(after.violations).toHaveLength(1);
    expect(after.violations[0]).toMatchObject({ type: 'doc-size', file: 'new.md' });

    const full = run({ cwd: dir, mode: 'full' });
    expect(full.violations.map((v) => v.file).sort()).toEqual(['new.md', 'old.md']);
  });

  it('doc-count and warnings stay repo-wide in diff mode', () => {
    dir = makeRepo();
    writeFileSync(
      join(dir, 'brickwall.config.json'),
      JSON.stringify({
        docs: { maxCount: 1, maxLines: 2, tiers: [] },
        exemptFiles: ['CHANGELOG.md', 'old.md'],
      }),
    );
    writeFileSync(join(dir, 'extra.md'), 'x\n');
    const result = run({ cwd: dir });
    // The count covers non-exempt docs only: old.md is exempt, so extra.md
    // alone sits within maxCount 1.
    const count = result.violations.filter((v) => v.type === 'doc-count');
    expect(count).toEqual([]);
    // Repo-wide exemption audit sees old.md even though it is unchanged.
    expect(result.warnings.some((w) => w.type === 'exemption-debt')).toBe(true);

    writeFileSync(join(dir, 'more.md'), 'y\n');
    const over = run({ cwd: dir });
    expect(over.violations.some((v) => v.type === 'doc-count')).toBe(true);
  });

  it('respects --base for committed work', () => {
    dir = makeRepo();
    writeFileSync(join(dir, 'branch.md'), '1\n2\n3\n');
    git(dir, 'add', '.');
    git(dir, 'commit', '-q', '-m', 'feature work');
    // vs HEAD: nothing changed.
    expect(run({ cwd: dir }).violations).toEqual([]);
    // vs the first commit: the committed doc is in scope.
    const base = execFileSync('git', ['rev-list', '--max-parents=0', 'HEAD'], {
      cwd: dir,
      encoding: 'utf-8',
    }).trim();
    const result = run({ cwd: dir, base });
    expect(result.violations).toMatchObject([{ type: 'doc-size', file: 'branch.md' }]);
  });

  it('errors (exit-2 class) when an EXPLICIT --base cannot be resolved', () => {
    dir = makeRepo();
    expect(() => run({ cwd: dir, base: 'no-such-ref' })).toThrow(
      BrickwallConfigError,
    );
    expect(() => run({ cwd: dir, base: 'no-such-ref' })).toThrow(/no-such-ref/);
  });

  it('warns stale-exemption for an entry whose only matches are archived', () => {
    dir = makeRepo();
    mkdirSync(join(dir, 'docs/archive'), { recursive: true });
    writeFileSync(join(dir, 'docs/archive/data.md'), 'x\n');
    writeFileSync(
      join(dir, 'brickwall.config.json'),
      JSON.stringify({ docs: { maxLines: 2, tiers: [] }, exemptFiles: ['data.md'] }),
    );
    const result = run({ cwd: dir });
    // Archive filtering precedes the debt audit, so the entry matches nothing.
    expect(result.warnings).toMatchObject([{ type: 'stale-exemption' }]);
  });

  it('falls back to full with a note outside a git work tree', () => {
    dir = mkdtempSync(join(tmpdir(), 'brickwall-nogit-'));
    writeFileSync(
      join(dir, 'brickwall.config.json'),
      JSON.stringify({ docs: { maxLines: 1, tiers: [] } }),
    );
    writeFileSync(join(dir, 'big.md'), 'a\nb\n');
    const result = run({ cwd: dir });
    expect(result.mode).toBe('full');
    expect(result.note).toContain('git');
    expect(result.violations).toHaveLength(1);
  });

  it('ignores files deleted but not yet staged (the petal crash class)', () => {
    dir = makeRepo();
    rmSync(join(dir, 'old.md'));
    expect(() => run({ cwd: dir })).not.toThrow();
    expect(() => run({ cwd: dir, mode: 'full' })).not.toThrow();
  });
});

describe('run — pragma scan boundaries', () => {
  let dir: string;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it('exemptFiles and test files never escape the pragma scan', () => {
    dir = mkdtempSync(join(tmpdir(), 'brickwall-pragma-'));
    const sample = readFileSync(
      new URL('./fixtures/pragmas/sample-code.txt', import.meta.url),
      'utf-8',
    );
    mkdirSync(join(dir, 'src'));
    writeFileSync(
      join(dir, 'brickwall.config.json'),
      JSON.stringify({ exemptFiles: ['src/data.ts'] }),
    );
    writeFileSync(join(dir, 'src/data.ts'), sample);
    writeFileSync(join(dir, 'src/a.test.ts'), sample);
    const result = run({ cwd: dir, mode: 'full' });
    const pragmaFiles = result.violations
      .filter((v) => v.type === 'banned-pragma')
      .map((v) => v.file)
      .sort();
    expect(new Set(pragmaFiles)).toEqual(new Set(['src/data.ts', 'src/a.test.ts']));
    // And the exemption itself is visible debt.
    expect(result.warnings.some((w) => w.type === 'exemption-debt')).toBe(true);
  });
});
