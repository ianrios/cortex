import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { run } from '../src/run.js';
import type { ViolationType } from '../src/checks.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, 'fixtures');

describe('run() against fixtures', () => {
  it('reports no violations for the clean fixture', () => {
    const { violations } = run({ cwd: join(fixtures, 'clean') });
    expect(violations).toEqual([]);
  });

  it('reports exactly one violation of each type for the violating fixture', () => {
    const { violations } = run({ cwd: join(fixtures, 'violating') });
    const types = violations.map((v) => v.type).sort();
    const expected: ViolationType[] = [
      'code-size',
      'doc-size',
      'eslint-disable',
      'md-count',
    ].sort() as ViolationType[];
    expect(types).toEqual(expected);
    expect(violations).toHaveLength(4);
  });

  it('picks up the violating fixture\'s own brickwall.config.json budgets', () => {
    const { config } = run({ cwd: join(fixtures, 'violating') });
    expect(config.budgets.mdFileCount).toBe(1);
    expect(config.budgets.codeLines).toBe(2);
  });

  it('falls back to default budgets for the clean fixture (no config file)', () => {
    const { config } = run({ cwd: join(fixtures, 'clean') });
    expect(config.budgets.mdFileCount).toBe(25);
  });
});
