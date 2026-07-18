import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { dirEntryMatch } from './match.js';

function toPosix(path: string): string {
  return path.split(sep).join('/');
}

function isIgnoredPath(relPath: string, ignoreDirs: string[]): boolean {
  return ignoreDirs.some((dir) => dirEntryMatch(relPath, dir) >= 0);
}

function walkFs(cwd: string, ignoreDirs: string[]): string[] {
  const results: string[] = [];

  function recurse(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (ignoreDirs.includes(entry.name)) continue;
        recurse(full);
      } else if (entry.isFile()) {
        results.push(toPosix(relative(cwd, full)));
      }
    }
  }

  recurse(cwd);
  return results;
}

function git(cwd: string, args: string[]): string[] | undefined {
  try {
    const out = execFileSync('git', args, {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out
      .split('\n')
      .filter((line) => line.length > 0)
      .map(toPosix);
  } catch {
    return undefined;
  }
}

/** Returns git-tracked + untracked-but-not-ignored files, or undefined if not a git work tree. */
function gitLsFiles(cwd: string): string[] | undefined {
  const files = git(cwd, [
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
  ]);
  // The index can list files missing from the working tree (unstaged
  // deletions); brickwall reads only the working tree, so drop them.
  return files?.filter((f) => existsSync(join(cwd, f)));
}

/**
 * Discovers files under `cwd` as posix-style paths relative to `cwd`.
 * Prefers `git ls-files` (honors .gitignore) when inside a git work tree;
 * falls back to a recursive fs walk otherwise. `ignoreDirs` is always
 * applied afterward so ignored directories never appear in either mode.
 */
export function walk(cwd: string, ignoreDirs: string[]): string[] {
  const files = gitLsFiles(cwd) ?? walkFs(cwd, ignoreDirs);
  return files.filter((f) => !isIgnoredPath(f, ignoreDirs));
}

// The ratified --audit skip list: bare names only, pruned during recursion.
const AUDIT_SKIP_DIRS = ['node_modules', '.git'];

/**
 * Full-scope audit walk for --audit. Always an fs walk (`git ls-files`
 * cannot see gitignored files) with ONLY node_modules and .git skipped —
 * config ignoreDirs do not apply. Sorted so output stays deterministic
 * (readdir order is not; git ls-files output already is).
 */
export function walkAll(cwd: string): string[] {
  return walkFs(cwd, AUDIT_SKIP_DIRS).sort();
}

/**
 * The diff-mode file source: files changed vs `base` (deletions excluded —
 * brickwall reads only the working tree) plus untracked files, which a diff
 * can never show. Undefined when `cwd` is not a git work tree or `base`
 * cannot be resolved — the caller falls back to a full run, loudly.
 */
export function gitChangedFiles(cwd: string, base: string): string[] | undefined {
  // --relative: paths come back relative to cwd (and scoped to it), matching
  // the walk — without it a subdirectory run would intersect nothing.
  const changed = git(cwd, [
    'diff',
    '--name-only',
    '--relative',
    '--diff-filter=d',
    base,
  ]);
  if (changed === undefined) return undefined;
  const untracked = git(cwd, ['ls-files', '--others', '--exclude-standard']);
  return [...new Set([...changed, ...(untracked ?? [])])];
}
