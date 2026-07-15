import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

function toPosix(path: string): string {
  return path.split(sep).join('/');
}

function normalizeConfigPath(dir: string): string {
  return dir.split('\\').join('/').replace(/\/+$/, '');
}

/**
 * True if `relPath` should be ignored. Bare names (no slash, e.g. "node_modules")
 * match as a path segment at any depth. Slash-containing entries (e.g. "docs/tmp")
 * match as a root-relative prefix, normalized to posix first (Windows-safe).
 */
function isIgnoredPath(relPath: string, ignoreDirs: string[]): boolean {
  const parts = relPath.split('/');
  return ignoreDirs.some((raw) => {
    const dir = normalizeConfigPath(raw);
    if (dir.includes('/')) {
      return relPath === dir || relPath.startsWith(`${dir}/`);
    }
    return parts.includes(dir);
  });
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

/** Returns git-tracked + untracked-but-not-ignored files, or undefined if not a git work tree. */
function gitLsFiles(cwd: string): string[] | undefined {
  try {
    const out = execFileSync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard'],
      { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return out
      .split('\n')
      .filter((line) => line.length > 0)
      .map(toPosix);
  } catch {
    return undefined;
  }
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

// The ratified --all skip list: bare names only, pruned during recursion.
const ALL_SKIP_DIRS = ['node_modules', '.git'];

/**
 * Full-scope audit walk for --all. Always an fs walk (`git ls-files` cannot
 * see gitignored files) with ONLY node_modules and .git skipped — config
 * ignoreDirs do not apply. Sorted so output stays deterministic (readdir
 * order is not; git ls-files output already is).
 */
export function walkAll(cwd: string): string[] {
  return walkFs(cwd, ALL_SKIP_DIRS).sort();
}
