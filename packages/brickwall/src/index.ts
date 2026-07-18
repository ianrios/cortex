export { run } from './run.js';
export type { RunMode, RunOptions, RunResult } from './run.js';
export type {
  BrickwallConfig,
  DocsConfig,
  CodeConfig,
} from './config.js';
export {
  DEFAULT_CONFIG,
  loadConfig,
  validateAndMergeConfig,
  BrickwallConfigError,
} from './config.js';
// The selector grammar's TYPES are public (they shape BrickwallConfig);
// its helper functions are internals — exporting them would freeze every
// grammar refactor into semver-major territory for zero external users.
export type { Selector, Tier } from './match.js';
export type {
  Violation,
  ViolationType,
  Warning,
  WarningType,
  FileContent,
} from './checks.js';
export {
  countLines,
  isArchived,
  isExemptFile,
  isTestFile,
  checkDocCount,
  checkDocSize,
  checkCodeSize,
  checkBannedPragmas,
  checkExemptionDebt,
  checkStaleTiers,
} from './checks.js';
export { walk, walkAll, gitChangedFiles } from './walk.js';
