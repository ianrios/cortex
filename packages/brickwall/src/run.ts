import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BrickwallConfigError,
  DEFAULT_CONFIG,
  loadConfig,
  type BrickwallConfig,
} from './config.js';
import { gitChangedFiles, walk, walkAll } from './walk.js';
import { classify } from './match.js';
import {
  checkBannedPragmas,
  checkCodeSize,
  checkDocCount,
  checkDocSize,
  checkExemptionDebt,
  checkStaleTiers,
  isArchived,
  isExemptFile,
  type FileContent,
  type Violation,
  type Warning,
} from './checks.js';

export type RunMode = 'diff' | 'full' | 'audit';

export interface RunOptions {
  cwd?: string;
  configPath?: string;
  /** Default 'diff': content checks restrict to files changed vs `base`;
   *  path-only checks (doc count, warnings) are ALWAYS repo-wide.
   *  'full' reads everything. 'audit' is the shields-off fs walk
   *  (ignore/archive/exempt lists disabled; exit semantics unchanged). */
  mode?: RunMode;
  /** Diff base ref, default 'HEAD' (staged + unstaged + untracked). */
  base?: string;
}

export interface RunResult {
  config: BrickwallConfig;
  violations: Violation[];
  warnings: Warning[];
  /** The mode that actually ran (diff falls back to full outside git). */
  mode: RunMode;
  note?: string;
}

function readAll(cwd: string, files: string[]): FileContent[] {
  return files.map((path) => ({
    path,
    content: readFileSync(join(cwd, path), 'utf-8'),
  }));
}

/** Orchestrates: load config, walk, classify, pick the content set for the
 *  mode, run every check. Path-only checks always see the whole walk. */
export function run(options: RunOptions = {}): RunResult {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd, options.configPath);
  const audit = options.mode === 'audit';

  const allFiles = audit ? walkAll(cwd) : walk(cwd, config.ignoreDirs);
  // --audit disables the archive/exempt lists entirely (which also empties
  // the exemption-debt channel: with nothing exempted there is no debt).
  const archiveDirs = audit ? [] : config.archiveDirs;
  const exemptFiles = audit ? [] : config.exemptFiles;

  // Archive filtering runs BEFORE classification: archived files are outside
  // every check, including the cross-section double-claim error.
  const active = allFiles.filter((f) => !isArchived(f, archiveDirs));

  const docFiles: string[] = [];
  const codeFiles: string[] = [];
  const ambiguous: string[] = [];
  for (const file of active) {
    switch (classify(file, config.docs.matches, config.code.matches)) {
      case 'docs':
        docFiles.push(file);
        break;
      case 'code':
        codeFiles.push(file);
        break;
      case 'ambiguous':
        ambiguous.push(file);
        break;
      case 'none':
        break;
    }
  }
  if (ambiguous.length > 0) {
    const shown = ambiguous.slice(0, 5).join(', ');
    const more = ambiguous.length > 5 ? ` (+${ambiguous.length - 5} more)` : '';
    throw new BrickwallConfigError(
      `brickwall config: docs.matches and code.matches both claim: ${shown}${more} ` +
        `— make one selector more specific (a "dirs" claim beats patterns-only).`,
    );
  }

  // Resolve the content set for the mode.
  let mode: RunMode = options.mode ?? 'diff';
  let note: string | undefined;
  let contentDocs = docFiles;
  let contentCode = codeFiles;
  if (mode === 'diff') {
    const changed = gitChangedFiles(cwd, options.base ?? 'HEAD');
    if (changed === undefined) {
      // Silent fallback is only for the implicit default. An EXPLICIT base
      // that fails (typo, shallow clone missing the ref) is a user error —
      // swapping in a full scan would change what the gate means.
      if (options.base !== undefined) {
        throw new BrickwallConfigError(
          `brickwall: --base "${options.base}" could not be resolved ` +
            `(not a git work tree, unknown ref, or ref not fetched)`,
        );
      }
      mode = 'full';
      note = 'diff mode needs a git work tree and resolvable base; ran --full instead';
    } else {
      const changedSet = new Set(changed);
      contentDocs = docFiles.filter((f) => changedSet.has(f));
      contentCode = codeFiles.filter((f) => changedSet.has(f));
    }
  }

  // Exempt docs are never checked, so never read them. Exempt CODE must
  // still be read: the pragma scan deliberately covers it.
  const docContents = readAll(
    cwd,
    contentDocs.filter((f) => !isExemptFile(f, exemptFiles)),
  );
  const codeContents = readAll(cwd, contentCode);
  const notExempt = ({ path }: FileContent): boolean =>
    !isExemptFile(path, exemptFiles);

  const violations: Violation[] = [
    // Path-only, always repo-wide.
    checkDocCount(
      docFiles.filter((f) => !isExemptFile(f, exemptFiles)),
      config.docs.maxCount,
    ),
    checkDocSize(docContents, config.docs.tiers, config.docs.maxLines),
    checkCodeSize(
      codeContents.filter(notExempt),
      config.code.tiers,
      config.code.maxLines,
      config.code.testFilePatterns,
    ),
    // exemptFiles and test files do NOT escape the pragma scan.
    checkBannedPragmas(codeContents, config.bannedPragmas),
  ].flat();

  // Warnings are path-only and repo-wide in EVERY mode — a diff run must
  // never fake stale-exemption/stale-tier signals from a partial view.
  const warnings: Warning[] = [
    ...checkExemptionDebt(
      [...docFiles, ...codeFiles],
      exemptFiles,
      DEFAULT_CONFIG.exemptFiles,
    ),
    ...checkStaleTiers('docs', config.docs.tiers, docFiles, DEFAULT_CONFIG.docs.tiers),
    ...checkStaleTiers('code', config.code.tiers, codeFiles, DEFAULT_CONFIG.code.tiers),
  ];

  return { config, violations, warnings, mode, note };
}
