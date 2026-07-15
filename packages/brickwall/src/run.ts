import { readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { loadConfig, type BrickwallConfig } from './config.js';
import { walk } from './walk.js';
import {
  checkCodeSize,
  checkDocSize,
  checkEslintDisable,
  checkMdCount,
  isTestFile,
  type FileContent,
  type Violation,
} from './checks.js';

export interface RunOptions {
  cwd?: string;
  configPath?: string;
}

export interface RunResult {
  config: BrickwallConfig;
  violations: Violation[];
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
  const allFiles = walk(cwd, config.ignoreDirs);

  const mdFiles = allFiles.filter((f) => f.endsWith('.md'));
  const codeFiles = allFiles.filter(
    (f) => config.codeExtensions.includes(extname(f)) && !isTestFile(f),
  );

  const mdContents = readAll(cwd, mdFiles);
  const codeContents = readAll(cwd, codeFiles);

  const violations: Violation[] = [
    ...checkMdCount(
      mdFiles,
      config.exemptDirs,
      config.exemptFiles,
      config.budgets.mdFileCount,
    ),
    ...checkDocSize(
      mdContents,
      config.storyDirs,
      config.exemptDirs,
      config.exemptFiles,
      config.budgets,
    ),
    ...checkCodeSize(codeContents, config.exemptDirs, config.budgets.codeLines),
    ...(config.banEslintDisable
      ? checkEslintDisable(codeContents, config.exemptDirs)
      : []),
  ];

  return { config, violations };
}
