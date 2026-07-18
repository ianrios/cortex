/**
 * The one selector grammar. A selector `{ dirs?, patterns? }` is used in
 * exactly two places — section membership (`matches`) and tiers — with
 * identical semantics: within a field ANY entry matches; across present
 * fields ALL must match. Validation lives in config.ts; everything here
 * is pure decision logic over posix-relative paths.
 */
export interface Selector {
  dirs?: string[];
  patterns?: string[];
}

/** A tier is a selector plus the line cap it grants. */
export interface Tier extends Selector {
  maxLines: number;
}

/** Backslash-tolerant slash normalization + trailing-slash strip — the one
 *  normalization for every config path entry (dirs, exemptFiles). */
export function normalizeSlashes(value: string): string {
  return value.split('\\').join('/').replace(/\/+$/, '');
}

/** The one basename extraction. */
export function basenameOf(relPath: string): string {
  return relPath.split('/').pop() ?? relPath;
}

/**
 * Dir-entry grammar: a leading `/` or an inner `/` root-anchors the entry
 * as a path prefix (`/docs`, `docs/api`); a bare single-segment name
 * (`docs`, `__fixtures__`) matches as a directory segment at any depth.
 */
export function normalizeDirEntry(raw: string): {
  anchored: boolean;
  value: string;
} {
  let value = normalizeSlashes(raw);
  const hadLeadingSlash = value.startsWith('/');
  if (hadLeadingSlash) value = value.replace(/^\/+/, '');
  return { anchored: hadLeadingSlash || value.includes('/'), value };
}

/**
 * Returns the length of the matched path prefix, or -1 when the entry does
 * not match. Longer matched prefixes are more specific — the cross-section
 * precedence rule compares these lengths. Bare names use their DEEPEST
 * occurrence so specificity reflects the actual directory matched.
 */
export function dirEntryMatch(relPath: string, rawEntry: string): number {
  const { anchored, value } = normalizeDirEntry(rawEntry);
  if (value.length === 0) return -1;
  if (anchored) {
    if (relPath === value || relPath.startsWith(`${value}/`)) {
      return value.length;
    }
    return -1;
  }
  const parts = relPath.split('/');
  let best = -1;
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i] === value) {
      best = parts.slice(0, i + 1).join('/').length;
    }
  }
  return best;
}

/** `*.scss` and bare `.scss` normalize to the suffix `.scss`; `*` alone
 *  is the empty suffix (matches every basename). */
export function normalizePattern(raw: string): string {
  return raw.startsWith('*') ? raw.slice(1) : raw;
}

/** Naive by design: the normalized suffix is tested against the basename,
 *  so `README.md` also catches `API-README.md`. */
export function patternMatch(relPath: string, rawPattern: string): boolean {
  return basenameOf(relPath).endsWith(normalizePattern(rawPattern));
}

/** Canonical selector identity: normalized, order-independent. Used for
 *  duplicate detection at validation AND default-tier recognition, so a
 *  reordered or re-spelled equivalent (`docs/` vs `/docs`, `*.md` vs `.md`)
 *  is the SAME selector everywhere. */
export function selectorKey(selector: Selector): string {
  const dirs = (selector.dirs ?? [])
    .map((d) => {
      const { anchored, value } = normalizeDirEntry(d);
      return `${anchored ? '/' : ''}${value}`;
    })
    .sort();
  const patterns = (selector.patterns ?? []).map(normalizePattern).sort();
  return JSON.stringify({ dirs, patterns });
}

export interface SelectorMatch {
  matched: boolean;
  /** -1 for a patterns-only claim; else the longest matched dir prefix
   *  length. Higher is more specific. */
  dirSpecificity: number;
}

export function matchSelector(relPath: string, selector: Selector): SelectorMatch {
  let dirSpecificity = -1;
  if (selector.dirs) {
    for (const entry of selector.dirs) {
      const matched = dirEntryMatch(relPath, entry);
      if (matched > dirSpecificity) dirSpecificity = matched;
    }
    if (dirSpecificity < 0) return { matched: false, dirSpecificity: -1 };
  }
  if (
    selector.patterns &&
    !selector.patterns.some((p) => patternMatch(relPath, p))
  ) {
    return { matched: false, dirSpecificity: -1 };
  }
  return { matched: true, dirSpecificity };
}

export type Classification = 'docs' | 'code' | 'none' | 'ambiguous';

/**
 * Cross-section precedence: a dirs-bearing claim beats a patterns-only
 * claim (naming a place is more specific than naming a type); between two
 * dirs-bearing claims the deeper matched prefix wins; a true tie is
 * 'ambiguous' and the caller raises it as a loud config error.
 */
export function classify(
  relPath: string,
  docsMatches: Selector[],
  codeMatches: Selector[],
): Classification {
  const best = (selectors: Selector[]): number | undefined => {
    let found: number | undefined;
    for (const selector of selectors) {
      const match = matchSelector(relPath, selector);
      if (!match.matched) continue;
      if (found === undefined || match.dirSpecificity > found) {
        found = match.dirSpecificity;
      }
    }
    return found;
  };
  const docs = best(docsMatches);
  const code = best(codeMatches);
  if (docs === undefined && code === undefined) return 'none';
  if (code === undefined) return 'docs';
  if (docs === undefined) return 'code';
  if (docs === code) return 'ambiguous';
  return docs > code ? 'docs' : 'code';
}

/** First matching tier in config order wins; no match falls to the
 *  section's default maxLines (the caller's job). */
export function resolveTier(relPath: string, tiers: Tier[]): Tier | undefined {
  return tiers.find((tier) => matchSelector(relPath, tier).matched);
}

/** Naive substring test against the posix path — the testFilePatterns
 *  matcher (`.test.`, `test_`, `__tests__/` are each one entry). */
export function matchesAnySubstring(relPath: string, needles: string[]): boolean {
  return needles.some((needle) => relPath.includes(needle));
}
