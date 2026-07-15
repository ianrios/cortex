export { run } from './run.js';
export type { RunOptions, RunResult } from './run.js';
export type {
  BrickwallConfig,
  BrickwallBudgets,
  CodeLinesBudget,
} from './config.js';
export {
  DEFAULT_CONFIG,
  loadConfig,
  validateAndMergeConfig,
  BrickwallConfigError,
} from './config.js';
export type { Violation, ViolationType, FileContent, DocTier } from './checks.js';
export {
  countLines,
  isExempt,
  isExemptFile,
  resolveDocTier,
  resolveCodeLimit,
  isTestFile,
  checkMdCount,
  checkDocSize,
  checkCodeSize,
  checkEslintDisable,
} from './checks.js';
export { walk } from './walk.js';
