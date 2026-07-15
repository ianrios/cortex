import { extname } from 'node:path';
import type { CodeLinesBudget } from './config.js';

export type ViolationType = 'md-count' | 'doc-size' | 'code-size' | 'eslint-disable';

export interface Violation {
  type: ViolationType;
  message: string;
  file?: string;
}

export type WarningType = 'exemption-debt' | 'stale-exemption';

/** Mirrors Violation. Warnings NEVER affect the exit code. */
export interface Warning {
  type: WarningType;
  message: string;
}

export interface FileContent {
  path: string;
  content: string;
}

/** Line count that does not count a trailing final newline as an extra line. */
export function countLines(content: string): number {
  return content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
}

function normalizeConfigPath(dir: string): string {
  return dir.split('\\').join('/').replace(/\/+$/, '');
}

function hasPrefix(file: string, dirs: string[]): boolean {
  return dirs.some((dir) => {
    const normalized = normalizeConfigPath(dir);
    return file === normalized || file.startsWith(`${normalized}/`);
  });
}

export function isExempt(file: string, archiveDirs: string[]): boolean {
  return hasPrefix(file, archiveDirs);
}

/** Matches by exact relative path OR basename (e.g. "CHANGELOG.md" matches any depth). */
export function isExemptFile(file: string, exemptFiles: string[]): boolean {
  const base = file.split('/').pop() ?? file;
  return exemptFiles.some((entry) => {
    const normalized = normalizeConfigPath(entry);
    return file === normalized || base === normalized;
  });
}

export type DocTier = 'story' | 'default';

/** Resolves which line-budget tier a doc file falls under. Call after exemption filtering. */
export function resolveDocTier(file: string, storyDirs: string[]): DocTier {
  return hasPrefix(file, storyDirs) ? 'story' : 'default';
}

const TEST_FILE_RE = /\.(test|spec)\./;

export function isTestFile(file: string): boolean {
  return TEST_FILE_RE.test(file);
}

/** Resolves the code-size limit for a file: a plain number applies to all files;
 *  a map looks up the file's extension (config validation guarantees coverage). */
export function resolveCodeLimit(file: string, codeLines: CodeLinesBudget): number {
  if (typeof codeLines === 'number') return codeLines;
  const ext = extname(file);
  const limit = codeLines[ext];
  if (limit === undefined) {
    throw new Error(`brickwall: no code-size budget configured for extension "${ext}"`);
  }
  return limit;
}

export function checkMdCount(
  mdFiles: string[],
  archiveDirs: string[],
  exemptFiles: string[],
  limit: number,
): Violation[] {
  const active = mdFiles.filter(
    (f) => !isExempt(f, archiveDirs) && !isExemptFile(f, exemptFiles),
  );
  if (active.length > limit) {
    return [
      {
        type: 'md-count',
        message: `Too many .md files: ${active.length} (max ${limit})`,
      },
    ];
  }
  return [];
}

export function checkDocSize(
  files: FileContent[],
  storyDirs: string[],
  archiveDirs: string[],
  exemptFiles: string[],
  budgets: { mdLines: number; storyLines: number },
): Violation[] {
  const violations: Violation[] = [];
  for (const { path, content } of files) {
    if (isExempt(path, archiveDirs) || isExemptFile(path, exemptFiles)) continue;
    const tier = resolveDocTier(path, storyDirs);
    const max = tier === 'story' ? budgets.storyLines : budgets.mdLines;
    const lines = countLines(content);
    if (lines > max) {
      violations.push({
        type: 'doc-size',
        message: `${path}: ${lines} lines (max ${max})`,
        file: path,
      });
    }
  }
  return violations;
}

export function checkCodeSize(
  files: FileContent[],
  archiveDirs: string[],
  exemptFiles: string[],
  codeLines: CodeLinesBudget,
): Violation[] {
  const violations: Violation[] = [];
  for (const { path, content } of files) {
    if (isExempt(path, archiveDirs) || isExemptFile(path, exemptFiles)) continue;
    if (isTestFile(path)) continue;
    const max = resolveCodeLimit(path, codeLines);
    const lines = countLines(content);
    if (lines > max) {
      violations.push({
        type: 'code-size',
        message: `${path}: ${lines} lines (max ${max})`,
        file: path,
      });
    }
  }
  return violations;
}

/**
 * Audits custom exemptFiles entries against the scanned set (the md and code
 * files the checks see — test files excluded, archiveDirs removed). Each
 * custom entry yields exactly one warning, in config-entry order: an
 * `exemption-debt` warning enumerating EVERY matched file (basename matching
 * means one entry can shield many), or `stale-exemption` when it matches
 * nothing. Default entries (e.g. CHANGELOG.md) are always silent.
 */
export function checkExemptionDebt(
  scannedFiles: string[],
  exemptFiles: string[],
  defaultExemptFiles: string[],
): Warning[] {
  const warnings: Warning[] = [];
  for (const entry of exemptFiles) {
    if (defaultExemptFiles.includes(entry)) continue;
    const matched = scannedFiles.filter((f) => isExemptFile(f, [entry]));
    if (matched.length > 0) {
      warnings.push({
        type: 'exemption-debt',
        message:
          `exemptFiles "${entry}" exempts ${matched.length} file(s): ` +
          matched.join(', '),
      });
    } else {
      warnings.push({
        type: 'stale-exemption',
        message: `exemptFiles "${entry}" matches no scanned file`,
      });
    }
  }
  return warnings;
}

// Matches the ESLint disable-comment pragma inside `//` line comments or
// `/* ... */` block comments. Deliberately a naive line-regex (matching the
// source scripts this was extracted from): it flags prose mentions of the
// pragma too, not just real directives. See the package README for details.
const ESLINT_DISABLE_RE = /\/\/.*(eslint-disable)|(\/\*.*eslint-disable.*\*\/)/;

export function checkEslintDisable(
  files: FileContent[],
  archiveDirs: string[],
): Violation[] {
  const violations: Violation[] = [];
  for (const { path, content } of files) {
    if (isExempt(path, archiveDirs)) continue;
    content.split('\n').forEach((line, i) => {
      if (ESLINT_DISABLE_RE.test(line)) {
        violations.push({
          type: 'eslint-disable',
          message: `${path}:${i + 1} - not allowed: ${line.trim()}`,
          file: path,
        });
      }
    });
  }
  return violations;
}
