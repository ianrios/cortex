import {
  BrickwallConfigError,
  DEFAULT_CONFIG,
  type BrickwallConfig,
  type CodeConfig,
  type DocsConfig,
} from './defaults.js';
import {
  normalizePattern,
  selectorKey,
  type Selector,
  type Tier,
} from './match.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertKnownKeys(
  input: Record<string, unknown>,
  allowed: readonly string[],
  where: string,
): void {
  for (const key of Object.keys(input)) {
    if (!allowed.includes(key)) {
      throw new BrickwallConfigError(
        `brickwall config: unknown key "${where}${key}"`,
      );
    }
  }
}

function assertStringArray(value: unknown, key: string): string[] {
  if (
    !Array.isArray(value) ||
    !value.every((v): v is string => typeof v === 'string' && v.length > 0)
  ) {
    throw new BrickwallConfigError(
      `brickwall config: "${key}" must be an array of non-empty strings`,
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

function assertNonEmpty(value: string[], key: string): string[] {
  // An empty selector field would be present-but-unmatchable: the selector
  // silently matches nothing, the quiet cousin of an empty `matches` list.
  if (value.length === 0) {
    throw new BrickwallConfigError(
      `brickwall config: "${key}" must not be an empty array — omit the field instead`,
    );
  }
  return value;
}

function parseSelector(input: unknown, key: string): Selector {
  if (!isRecord(input)) {
    throw new BrickwallConfigError(`brickwall config: "${key}" must be an object`);
  }
  assertKnownKeys(input, ['dirs', 'patterns'], `${key}.`);
  const selector: Selector = {};
  if ('dirs' in input) {
    selector.dirs = assertNonEmpty(
      assertStringArray(input.dirs, `${key}.dirs`),
      `${key}.dirs`,
    );
  }
  if ('patterns' in input) {
    const patterns = assertNonEmpty(
      assertStringArray(input.patterns, `${key}.patterns`),
      `${key}.patterns`,
    );
    const seen = new Set<string>();
    for (const pattern of patterns) {
      const normalized = normalizePattern(pattern);
      // A normalized suffix containing / or * is glob-shaped and can never
      // match a basename — it would silently disable the selector.
      if (normalized.includes('/') || normalized.includes('*')) {
        throw new BrickwallConfigError(
          `brickwall config: "${key}.patterns" entry "${pattern}" is not a ` +
            `basename suffix — patterns are suffixes (".md", "*.storybook.py"); ` +
            `use "dirs" to scope by path`,
        );
      }
      if (seen.has(normalized)) {
        throw new BrickwallConfigError(
          `brickwall config: "${key}.patterns" has duplicate entries after ` +
            `normalization ("${pattern}")`,
        );
      }
      seen.add(normalized);
    }
    selector.patterns = patterns;
  }
  if (!selector.dirs && !selector.patterns) {
    throw new BrickwallConfigError(
      `brickwall config: "${key}" needs at least one of "dirs"/"patterns"`,
    );
  }
  return selector;
}

function parseMatches(input: unknown, key: string): Selector[] {
  if (!Array.isArray(input) || input.length === 0) {
    // An empty list would silently disable a whole section's checks.
    throw new BrickwallConfigError(
      `brickwall config: "${key}" must be a non-empty array of selectors`,
    );
  }
  const selectors = input.map((s, i) => parseSelector(s, `${key}[${i}]`));
  const seen = new Set<string>();
  for (const [i, selector] of selectors.entries()) {
    const id = selectorKey(selector);
    if (seen.has(id)) {
      throw new BrickwallConfigError(
        `brickwall config: "${key}[${i}]" duplicates an earlier selector`,
      );
    }
    seen.add(id);
  }
  return selectors;
}

function parseTiers(input: unknown, key: string): Tier[] {
  if (!Array.isArray(input)) {
    throw new BrickwallConfigError(`brickwall config: "${key}" must be an array`);
  }
  const seen = new Set<string>();
  return input.map((raw, i) => {
    const where = `${key}[${i}]`;
    if (!isRecord(raw)) {
      throw new BrickwallConfigError(`brickwall config: "${where}" must be an object`);
    }
    assertKnownKeys(raw, ['dirs', 'patterns', 'maxLines'], `${where}.`);
    const { maxLines, ...selectorPart } = raw;
    const selector = parseSelector(selectorPart, where);
    const id = selectorKey(selector);
    if (seen.has(id)) {
      throw new BrickwallConfigError(
        `brickwall config: "${where}" duplicates an earlier tier's selector`,
      );
    }
    seen.add(id);
    return { ...selector, maxLines: assertPositiveNumber(maxLines, `${where}.maxLines`) };
  });
}

function parseDocs(input: unknown, base: DocsConfig): DocsConfig {
  if (input === undefined) return base;
  if (!isRecord(input)) {
    throw new BrickwallConfigError('brickwall config: "docs" must be an object');
  }
  assertKnownKeys(input, ['matches', 'maxCount', 'maxLines', 'tiers'], 'docs.');
  return {
    matches: 'matches' in input ? parseMatches(input.matches, 'docs.matches') : base.matches,
    maxCount:
      'maxCount' in input ? assertPositiveNumber(input.maxCount, 'docs.maxCount') : base.maxCount,
    maxLines:
      'maxLines' in input ? assertPositiveNumber(input.maxLines, 'docs.maxLines') : base.maxLines,
    tiers: 'tiers' in input ? parseTiers(input.tiers, 'docs.tiers') : base.tiers,
  };
}

function parseCode(input: unknown, base: CodeConfig): CodeConfig {
  if (input === undefined) return base;
  if (!isRecord(input)) {
    throw new BrickwallConfigError('brickwall config: "code" must be an object');
  }
  assertKnownKeys(input, ['matches', 'maxLines', 'tiers', 'testFilePatterns'], 'code.');
  return {
    matches: 'matches' in input ? parseMatches(input.matches, 'code.matches') : base.matches,
    maxLines:
      'maxLines' in input ? assertPositiveNumber(input.maxLines, 'code.maxLines') : base.maxLines,
    tiers: 'tiers' in input ? parseTiers(input.tiers, 'code.tiers') : base.tiers,
    testFilePatterns:
      'testFilePatterns' in input
        ? assertStringArray(input.testFilePatterns, 'code.testFilePatterns')
        : base.testFilePatterns,
  };
}

function parseBannedPragmas(input: unknown): string[] {
  if (input === undefined) return DEFAULT_CONFIG.bannedPragmas;
  // May be [] — that visibly disables the pragma scan.
  return assertStringArray(input, 'bannedPragmas');
}

/** Pure: validates a parsed JSON-like value and merges it over the defaults.
 *  Groups merge per key; every array (matches, tiers, the top-level lists)
 *  replaces its default wholesale. */
export function validateAndMergeConfig(input: unknown): BrickwallConfig {
  if (input === undefined || input === null) {
    return structuredClone(DEFAULT_CONFIG);
  }
  if (!isRecord(input)) {
    throw new BrickwallConfigError('brickwall config: root must be an object');
  }
  assertKnownKeys(
    input,
    ['docs', 'code', 'bannedPragmas', 'archiveDirs', 'exemptFiles', 'ignoreDirs'],
    '',
  );
  return {
    docs: parseDocs(input.docs, DEFAULT_CONFIG.docs),
    code: parseCode(input.code, DEFAULT_CONFIG.code),
    bannedPragmas: parseBannedPragmas(input.bannedPragmas),
    archiveDirs:
      input.archiveDirs === undefined
        ? DEFAULT_CONFIG.archiveDirs
        : assertStringArray(input.archiveDirs, 'archiveDirs'),
    exemptFiles:
      input.exemptFiles === undefined
        ? DEFAULT_CONFIG.exemptFiles
        : assertStringArray(input.exemptFiles, 'exemptFiles'),
    ignoreDirs:
      input.ignoreDirs === undefined
        ? DEFAULT_CONFIG.ignoreDirs
        : assertStringArray(input.ignoreDirs, 'ignoreDirs'),
  };
}
