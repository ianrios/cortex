import { readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { DEFAULT_CONFIG, loadConfig, type BrickwallConfig } from './config.js';
import { walk, walkAll } from './walk.js';
import {
  checkCodeSize,
  checkDocSize,
  checkEslintDisable,
  checkExemptionDebt,
  checkMdCount,
  isExempt,
  isTestFile,
  type FileContent,
  type Violation,
  type Warning,
} from './checks.js';

export interface RunOptions {
  cwd?: string;
  configPath?: string;
  /** Full-scope audit: fs walk skipping only node_modules and .git;
   *  archiveDirs and exemptFiles are disabled too. Exit semantics unchanged. */
  all?: boolean;
}

export interface RunResult {
  config: BrickwallConfig;
  violations: Violation[];
  warnings: Warning[];
}

function readAll(cwd: string, files: string[]): FileContent[] {
  return files.map((path) => ({
    path,
    content: readFileSync(join(cwd, path), 'utf-8'),
  }));
}

/** Orchestrates: load config, walk the repo, read files, run every check. */
export function run(options: RunOptions = {}): RunResult {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd, options.configPath);
  const allFiles = options.all ? walkAll(cwd) : walk(cwd, config.ignoreDirs);

  // --all disables the archive/exempt lists entirely (which also empties the
  // warnings channel: with nothing exempted there is no exemption debt).
  const archiveDirs = options.all ? [] : config.archiveDirs;
  const exemptFiles = options.all ? [] : config.exemptFiles;

  const mdFiles = allFiles.filter((f) => f.endsWith('.md'));
  const codeFiles = allFiles.filter(
    (f) => config.codeExtensions.includes(extname(f)) && !isTestFile(f),
  );

  const mdContents = readAll(cwd, mdFiles);
  const codeContents = readAll(cwd, codeFiles);

  const violations: Violation[] = [
    ...checkMdCount(mdFiles, archiveDirs, exemptFiles, config.budgets.mdFileCount),
    ...checkDocSize(mdContents, config.storyDirs, archiveDirs, exemptFiles, config.budgets),
    ...checkCodeSize(codeContents, archiveDirs, exemptFiles, config.budgets.codeLines),
    ...(config.banEslintDisable
      ? checkEslintDisable(codeContents, archiveDirs)
      : []),
  ];

  // Warning scan set: md ∪ code files as the checks see them, minus archives.
  const scanned = [...mdFiles, ...codeFiles].filter(
    (f) => !isExempt(f, archiveDirs),
  );
  const warnings = checkExemptionDebt(
    scanned,
    exemptFiles,
    DEFAULT_CONFIG.exemptFiles,
  );

  return { config, violations, warnings };
}
