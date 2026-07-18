import { readFileSync } from 'node:fs';
import type { Selector, Tier } from './match.js';

/** Thrown for bad config or unreadable/ambiguous config sources — always maps to exit 2. */
export class BrickwallConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrickwallConfigError';
  }
}

export interface DocsConfig {
  matches: Selector[];
  maxCount: number;
  maxLines: number;
  tiers: Tier[];
}

export interface CodeConfig {
  matches: Selector[];
  maxLines: number;
  tiers: Tier[];
  testFilePatterns: string[];
}

export interface BrickwallConfig {
  docs: DocsConfig;
  code: CodeConfig;
  bannedPragmas: string[];
  archiveDirs: string[];
  exemptFiles: string[];
  ignoreDirs: string[];
}

// Default pragma VALUES live in a JSON data file so brickwall's own
// source never contains a banned substring (the scan would flag it).
const DEFAULT_BANNED_PRAGMAS = JSON.parse(
  readFileSync(new URL('./banned-pragmas.json', import.meta.url), 'utf-8'),
) as string[];

export const DEFAULT_CONFIG: BrickwallConfig = {
  docs: {
    matches: [{ patterns: ['.md'] }],
    maxCount: 25,
    maxLines: 80,
    tiers: [{ dirs: ['.ai/plans', '.ai/specs', '/docs'], maxLines: 280 }],
  },
  code: {
    matches: [{ patterns: ['.ts', '.tsx', '.js', '.jsx'] }],
    maxLines: 250,
    tiers: [],
    testFilePatterns: ['.test.', '.spec.'],
  },
  bannedPragmas: DEFAULT_BANNED_PRAGMAS,
  // .changeset (changeset init scaffolds a README), .claude (Claude Code
  // skills/commands are markdown), .github (issue/PR templates), and the
  // editor/agent config dirs (.vscode, .codex, .cursor) would otherwise
  // eat the doc-count budget in adopter repos.
  ignoreDirs: [
    'node_modules', '.git', 'dist', 'build', 'coverage',
    '.changeset', '.claude', '.github', '.vscode', '.codex', '.cursor',
  ],
  archiveDirs: ['.ai/completed', 'docs/archive'],
  exemptFiles: ['CHANGELOG.md'],
};
