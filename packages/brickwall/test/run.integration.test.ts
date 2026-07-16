import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { run } from '../src/run.js';
import type { ViolationType } from '../src/checks.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, 'fixtures');

describe('run() against fixtures', () => {
  it('reports no violations and no warnings for the clean fixture', () => {
    const { violations, warnings } = run({ cwd: join(fixtures, 'clean') });
    expect(violations).toEqual([]);
    expect(warnings).toEqual([]);
  });

  it('reports exactly one violation of each type for the violating fixture', () => {
    const { violations } = run({ cwd: join(fixtures, 'violating') });
    const types = violations.map((v) => v.type).sort();
    const expected: ViolationType[] = [
      'code-size',
      'doc-size',
      'eslint-disable',
      'md-count',
    ].sort() as ViolationType[];
    expect(types).toEqual(expected);
    expect(violations).toHaveLength(4);
  });

  it('picks up the violating fixture\'s own brickwall.config.json budgets', () => {
    const { config } = run({ cwd: join(fixtures, 'violating') });
    expect(config.budgets.mdFileCount).toBe(1);
    expect(config.budgets.codeLines).toBe(2);
  });

  it('falls back to default budgets for the clean fixture (no config file)', () => {
    const { config } = run({ cwd: join(fixtures, 'clean') });
    expect(config.budgets.mdFileCount).toBe(25);
  });

  it('sees a doc hidden in an ignored dir only under --all', () => {
    const cwd = join(fixtures, 'all-mode');
    expect(run({ cwd }).violations).toEqual([]);
    const { violations } = run({ cwd, all: true });
    expect(violations).toEqual([
      {
        type: 'doc-size',
        message: 'hidden/big.md: 5 lines (max 3)',
        file: 'hidden/big.md',
      },
    ]);
  });
});

describe('run() in temp repos (warnings + --all discovery)', () => {
  let dir: string;

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  function makeTmpRepo(config: object): string {
    const d = mkdtempSync(join(tmpdir(), 'brickwall-run-'));
    writeFileSync(join(d, 'brickwall.config.json'), JSON.stringify(config));
    return d;
  }

  it('passes an oversized exemptFiles code file WITH an exemption-debt warning', () => {
    dir = makeTmpRepo({ budgets: { codeLines: 2 }, exemptFiles: ['big.ts'] });
    mkdirSync(join(dir, 'src'));
    writeFileSync(
      join(dir, 'src', 'big.ts'),
      'const a = 1;\nconst b = 2;\nconst c = 3;\n',
    );
    const { violations, warnings } = run({ cwd: dir });
    expect(violations).toEqual([]);
    expect(warnings).toEqual([
      {
        type: 'exemption-debt',
        message: 'exemptFiles "big.ts" exempts 1 file(s): src/big.ts',
      },
    ]);
  });

  it('still fires eslint-disable inside an exemptFiles-exempted file', () => {
    dir = makeTmpRepo({ budgets: { codeLines: 50 }, exemptFiles: ['bad.ts'] });
    mkdirSync(join(dir, 'src'));
    // Written at runtime as data — the ban on the pragma in source does not
    // apply to test-generated content.
    writeFileSync(
      join(dir, 'src', 'bad.ts'),
      '// eslint-disable-next-line no-console\nconsole.log(1);\n',
    );
    const { violations, warnings } = run({ cwd: dir });
    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe('eslint-disable');
    expect(warnings).toEqual([
      {
        type: 'exemption-debt',
        message: 'exemptFiles "bad.ts" exempts 1 file(s): src/bad.ts',
      },
    ]);
  });

  it('reports a custom entry matching nothing as stale-exemption', () => {
    dir = makeTmpRepo({ exemptFiles: ['ghost.md'] });
    writeFileSync(join(dir, 'README.md'), '# hi\n');
    const { violations, warnings } = run({ cwd: dir });
    expect(violations).toEqual([]);
    expect(warnings).toEqual([
      {
        type: 'stale-exemption',
        message: 'exemptFiles "ghost.md" matches no scanned file',
      },
    ]);
  });

  it('counts an entry whose only matches are archived as stale', () => {
    dir = makeTmpRepo({ archiveDirs: ['old'], exemptFiles: ['legacy.md'] });
    mkdirSync(join(dir, 'old'));
    writeFileSync(join(dir, 'old', 'legacy.md'), '# legacy\n');
    const { warnings } = run({ cwd: dir });
    expect(warnings).toEqual([
      {
        type: 'stale-exemption',
        message: 'exemptFiles "legacy.md" matches no scanned file',
      },
    ]);
  });

  it('discovers a runtime-created gitignored file under --all, never node_modules', () => {
    dir = makeTmpRepo({ budgets: { mdLines: 2 } });
    execFileSync('git', ['init'], { cwd: dir, stdio: 'ignore' });
    writeFileSync(join(dir, '.gitignore'), 'secret.md\n');
    writeFileSync(join(dir, 'secret.md'), 'a\nb\nc\nd\n');
    mkdirSync(join(dir, 'node_modules'));
    writeFileSync(join(dir, 'node_modules', 'hidden.md'), 'a\nb\nc\nd\n');

    // Normal run: git ls-files cannot see the gitignored file, and default
    // ignoreDirs drop node_modules.
    expect(run({ cwd: dir }).violations).toEqual([]);

    // --all: fs walk finds the gitignored file; node_modules stays skipped
    // (exact equality — no node_modules/hidden.md violation appears).
    const { violations } = run({ cwd: dir, all: true });
    expect(violations).toEqual([
      { type: 'doc-size', message: 'secret.md: 4 lines (max 2)', file: 'secret.md' },
    ]);
  });

  it('skips tracked files deleted from the working tree (unstaged deletion)', () => {
    // Found dogfooding petal: git ls-files --cached lists a file whose
    // deletion is unstaged; reading it crashed with a raw ENOENT.
    dir = makeTmpRepo({ budgets: { mdLines: 2 } });
    execFileSync('git', ['init'], { cwd: dir, stdio: 'ignore' });
    writeFileSync(join(dir, 'doomed.md'), 'a\nb\nc\nd\n');
    execFileSync('git', ['add', 'doomed.md'], { cwd: dir, stdio: 'ignore' });
    execFileSync(
      'git',
      ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-m', 'x'],
      { cwd: dir, stdio: 'ignore' },
    );
    rmSync(join(dir, 'doomed.md'));

    const { violations } = run({ cwd: dir });
    expect(violations).toEqual([]);
  });

  it('disables archiveDirs and exemptFiles under --all (warnings empty too)', () => {
    dir = makeTmpRepo({
      budgets: { mdLines: 2 },
      archiveDirs: ['old'],
      exemptFiles: ['data.md'],
    });
    mkdirSync(join(dir, 'old'));
    writeFileSync(join(dir, 'old', 'archived.md'), 'a\nb\nc\n');
    writeFileSync(join(dir, 'data.md'), 'a\nb\nc\n');

    const normal = run({ cwd: dir });
    expect(normal.violations).toEqual([]);
    expect(normal.warnings.map((w) => w.type)).toEqual(['exemption-debt']);

    const all = run({ cwd: dir, all: true });
    expect(all.violations.map((v) => v.file).sort()).toEqual([
      'data.md',
      'old/archived.md',
    ]);
    expect(all.warnings).toEqual([]);
  });
});
