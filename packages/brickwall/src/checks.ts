import {
  basenameOf,
  dirEntryMatch,
  matchesAnySubstring,
  normalizeSlashes,
  resolveTier,
  selectorKey,
  type Tier,
} from './match.js';

export type ViolationType = 'doc-count' | 'doc-size' | 'code-size' | 'banned-pragma';

export interface Violation {
  type: ViolationType;
  message: string;
  file?: string;
}

export type WarningType = 'exemption-debt' | 'stale-exemption' | 'stale-tier';

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

/** Archive membership uses the one dir-entry grammar (bare = any depth,
 *  slash = root prefix, leading `/` root-anchors). */
export function isArchived(file: string, archiveDirs: string[]): boolean {
  return archiveDirs.some((dir) => dirEntryMatch(file, dir) >= 0);
}

/** Matches by exact relative path OR basename (e.g. "CHANGELOG.md" matches any depth). */
export function isExemptFile(file: string, exemptFiles: string[]): boolean {
  const base = basenameOf(file);
  return exemptFiles.some((entry) => {
    const normalized = normalizeSlashes(entry);
    return file === normalized || base === normalized;
  });
}

export function isTestFile(file: string, testFilePatterns: string[]): boolean {
  return matchesAnySubstring(file, testFilePatterns);
}

export function checkDocCount(docFiles: string[], limit: number): Violation[] {
  if (docFiles.length > limit) {
    return [
      {
        type: 'doc-count',
        message: `Too many doc files: ${docFiles.length} (max ${limit})`,
      },
    ];
  }
  return [];
}

/** First matching tier in config order sets the cap; else the section default. */
function limitFor(file: string, tiers: Tier[], maxLines: number): number {
  return resolveTier(file, tiers)?.maxLines ?? maxLines;
}

export function checkDocSize(
  files: FileContent[],
  tiers: Tier[],
  maxLines: number,
): Violation[] {
  const violations: Violation[] = [];
  for (const { path, content } of files) {
    const max = limitFor(path, tiers, maxLines);
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
  tiers: Tier[],
  maxLines: number,
  testFilePatterns: string[],
): Violation[] {
  const violations: Violation[] = [];
  for (const { path, content } of files) {
    // Test files skip the size cap ONLY — never the pragma scan.
    if (isTestFile(path, testFilePatterns)) continue;
    const max = limitFor(path, tiers, maxLines);
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
 * Bare per-line substring scan — no comment parsing, so it is fully
 * language-agnostic and prose mentions flag deliberately. Runs on EVERY
 * code file including tests and exemptFiles; only archiveDirs escape.
 * One violation per line: the first configured pragma that matches.
 */
export function checkBannedPragmas(
  files: FileContent[],
  bannedPragmas: string[],
): Violation[] {
  if (bannedPragmas.length === 0) return [];
  const violations: Violation[] = [];
  for (const { path, content } of files) {
    content.split('\n').forEach((line, i) => {
      const pragma = bannedPragmas.find((p) => line.includes(p));
      if (pragma !== undefined) {
        violations.push({
          type: 'banned-pragma',
          message: `${path}:${i + 1} - banned pragma "${pragma}": ${line.trim()}`,
          file: path,
        });
      }
    });
  }
  return violations;
}

/**
 * Audits custom exemptFiles entries against the scanned set (doc and code
 * files as the checks see them, archives removed). Each custom entry yields
 * exactly one warning, in config-entry order: `exemption-debt` enumerating
 * EVERY matched file, or `stale-exemption` when it matches nothing.
 * Default entries (e.g. CHANGELOG.md) are always silent.
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

/** A custom tier matching zero of its section's files is dead or fully
 *  shadowed — never silent (the `stale-exemption` pattern applied to
 *  tiers). Default tiers stay silent, like default exemptFiles: a fresh
 *  adopter repo without `.ai/plans` is not misconfigured. */
export function checkStaleTiers(
  section: 'docs' | 'code',
  tiers: Tier[],
  sectionFiles: string[],
  defaultTiers: Tier[],
): Warning[] {
  // selectorKey identity: a re-spelled or reordered equivalent of a default
  // tier ("docs/" for "/docs", "*.md" for ".md") is still a default tier.
  const tierKey = (t: Tier): string => `${selectorKey(t)}#${t.maxLines}`;
  const defaults = new Set(defaultTiers.map(tierKey));
  const live = new Set<Tier>();
  for (const file of sectionFiles) {
    const tier = resolveTier(file, tiers);
    if (tier) live.add(tier);
  }
  const warnings: Warning[] = [];
  tiers.forEach((tier, i) => {
    if (defaults.has(tierKey(tier))) return;
    if (!live.has(tier)) {
      warnings.push({
        type: 'stale-tier',
        message: `${section}.tiers[${i}] matches no scanned file`,
      });
    }
  });
  return warnings;
}
