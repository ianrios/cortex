import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Thrown for bad config or unreadable/ambiguous config sources — always maps to exit 2. */
export class BrickwallConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrickwallConfigError';
  }
}

/** A plain number applies to every codeExtensions entry; a map sets a per-extension cap. */
export type CodeLinesBudget = number | Record<string, number>;

export interface BrickwallBudgets {
  mdFileCount: number;
  mdLines: number;
  storyLines: number;
  codeLines: CodeLinesBudget;
}

export interface BrickwallConfig {
  budgets: BrickwallBudgets;
  storyDirs: string[];
  exemptDirs: string[];
  exemptFiles: string[];
  ignoreDirs: string[];
  codeExtensions: string[];
  banEslintDisable: boolean;
}

export const DEFAULT_CONFIG: BrickwallConfig = {
  budgets: {
    mdFileCount: 25,
    mdLines: 80,
    storyLines: 280,
    codeLines: 250,
  },
  storyDirs: ['.ai/plans', '.ai/specs', 'docs'],
  exemptDirs: ['.ai/completed', 'docs/archive'],
  exemptFiles: ['CHANGELOG.md'],
  // .changeset (changeset init scaffolds a README), .claude (Claude Code
  // skills/commands are markdown), .github (issue/PR templates) would
  // otherwise eat the md-count budget in adopter repos.
  ignoreDirs: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.changeset',
    '.claude',
    '.github',
  ],
  codeExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  banEslintDisable: true,
};

const TOP_LEVEL_KEYS = new Set<keyof BrickwallConfig>([
  'budgets',
  'storyDirs',
  'exemptDirs',
  'exemptFiles',
  'ignoreDirs',
  'codeExtensions',
  'banEslintDisable',
]);

const BUDGET_KEYS = new Set<keyof BrickwallBudgets>([
  'mdFileCount',
  'mdLines',
  'storyLines',
  'codeLines',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertStringArray(value: unknown, key: string): string[] {
  if (
    !Array.isArray(value) ||
    !value.every((v): v is string => typeof v === 'string')
  ) {
    throw new BrickwallConfigError(
      `brickwall config: "${key}" must be an array of strings`,
    );
  }
  return value;
}

function assertPositiveNumber(value: unknown, key: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new BrickwallConfigError(
      `brickwall config: "${key}" must be a positive number`,
    );
  }
  return value;
}

function assertBoolean(value: unknown, key: string): boolean {
  if (typeof value !== 'boolean') {
    throw new BrickwallConfigError(`brickwall config: "${key}" must be a boolean`);
  }
  return value;
}

function parseCodeLines(value: unknown, key: string): CodeLinesBudget {
  if (typeof value === 'number') {
    return assertPositiveNumber(value, key);
  }
  if (isRecord(value)) {
    const result: Record<string, number> = {};
    for (const [ext, limit] of Object.entries(value)) {
      result[ext] = assertPositiveNumber(limit, `${key}.${ext}`);
    }
    return result;
  }
  throw new BrickwallConfigError(
    `brickwall config: "${key}" must be a positive number or a map of extension to positive number`,
  );
}

function parseBudgets(
  input: unknown,
  base: BrickwallBudgets,
): BrickwallBudgets {
  if (input === undefined) return base;
  if (!isRecord(input)) {
    throw new BrickwallConfigError('brickwall config: "budgets" must be an object');
  }
  const result = { ...base };
  for (const key of Object.keys(input)) {
    if (!BUDGET_KEYS.has(key as keyof BrickwallBudgets)) {
      throw new BrickwallConfigError(`brickwall config: unknown key "budgets.${key}"`);
    }
  }
  for (const key of ['mdFileCount', 'mdLines', 'storyLines'] as const) {
    if (key in input) result[key] = assertPositiveNumber(input[key], `budgets.${key}`);
  }
  if ('codeLines' in input) {
    result.codeLines = parseCodeLines(input.codeLines, 'budgets.codeLines');
  }
  return result;
}

/** Pure: validates a parsed JSON-like value and merges it over the defaults. */
export function validateAndMergeConfig(input: unknown): BrickwallConfig {
  if (input === undefined || input === null) return { ...DEFAULT_CONFIG };
  if (!isRecord(input)) {
    throw new BrickwallConfigError('brickwall config: root must be an object');
  }
  for (const key of Object.keys(input)) {
    if (!TOP_LEVEL_KEYS.has(key as keyof BrickwallConfig)) {
      throw new BrickwallConfigError(`brickwall config: unknown key "${key}"`);
    }
  }
  const config: BrickwallConfig = {
    budgets: parseBudgets(input.budgets, DEFAULT_CONFIG.budgets),
    storyDirs:
      input.storyDirs === undefined
        ? DEFAULT_CONFIG.storyDirs
        : assertStringArray(input.storyDirs, 'storyDirs'),
    exemptDirs:
      input.exemptDirs === undefined
        ? DEFAULT_CONFIG.exemptDirs
        : assertStringArray(input.exemptDirs, 'exemptDirs'),
    exemptFiles:
      input.exemptFiles === undefined
        ? DEFAULT_CONFIG.exemptFiles
        : assertStringArray(input.exemptFiles, 'exemptFiles'),
    ignoreDirs:
      input.ignoreDirs === undefined
        ? DEFAULT_CONFIG.ignoreDirs
        : assertStringArray(input.ignoreDirs, 'ignoreDirs'),
    codeExtensions:
      input.codeExtensions === undefined
        ? DEFAULT_CONFIG.codeExtensions
        : assertStringArray(input.codeExtensions, 'codeExtensions'),
    banEslintDisable:
      input.banEslintDisable === undefined
        ? DEFAULT_CONFIG.banEslintDisable
        : assertBoolean(input.banEslintDisable, 'banEslintDisable'),
  };
  if (typeof config.budgets.codeLines === 'object') {
    for (const ext of config.codeExtensions) {
      if (!(ext in config.budgets.codeLines)) {
        throw new BrickwallConfigError(
          `brickwall config: budgets.codeLines is missing an entry for codeExtensions ` +
            `"${ext}" (per-extension maps must cover every configured extension)`,
        );
      }
    }
  }
  return config;
}

interface ConfigSource {
  raw: unknown;
  path: string;
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    throw new BrickwallConfigError(
      `brickwall config: could not read or parse "${path}": ${(err as Error).message}`,
    );
  }
}

/** IO: locates the config source (explicit path, config file, or package.json key). */
export function findConfigSource(
  cwd: string,
  explicitPath?: string,
): ConfigSource | undefined {
  if (explicitPath) {
    return { raw: readJson(explicitPath), path: explicitPath };
  }

  const configPath = join(cwd, 'brickwall.config.json');
  const pkgPath = join(cwd, 'package.json');
  const hasConfigFile = existsSync(configPath);
  const pkg = existsSync(pkgPath)
    ? (readJson(pkgPath) as Record<string, unknown>)
    : undefined;
  const hasPkgKey = pkg !== undefined && 'brickwall' in pkg;

  if (hasConfigFile && hasPkgKey) {
    throw new BrickwallConfigError(
      'brickwall config: found both brickwall.config.json and a "brickwall" key ' +
        'in package.json — use only one.',
    );
  }
  if (hasConfigFile) {
    return { raw: readJson(configPath), path: configPath };
  }
  if (hasPkgKey) {
    return { raw: pkg.brickwall, path: pkgPath };
  }
  return undefined;
}

/** IO shell: loads and validates config from cwd (or an explicit path). */
export function loadConfig(cwd: string, explicitPath?: string): BrickwallConfig {
  const source = findConfigSource(cwd, explicitPath);
  return validateAndMergeConfig(source?.raw);
}
