import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  BrickwallConfigError,
  DEFAULT_CONFIG,
  findConfigSource,
  loadConfig,
} from '../src/config.js';

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), 'brickwall-config-'));
}

describe('findConfigSource / loadConfig (IO)', () => {
  let dir: string;

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it('returns undefined when neither source exists, and loadConfig falls back to defaults', () => {
    dir = makeTmpDir();
    expect(findConfigSource(dir)).toBeUndefined();
    expect(loadConfig(dir)).toEqual(DEFAULT_CONFIG);
  });

  it('reads brickwall.config.json when present', () => {
    dir = makeTmpDir();
    writeFileSync(
      join(dir, 'brickwall.config.json'),
      JSON.stringify({ budgets: { mdLines: 42 } }),
    );
    const config = loadConfig(dir);
    expect(config.budgets.mdLines).toBe(42);
  });

  it('reads a "brickwall" key from package.json when present', () => {
    dir = makeTmpDir();
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ name: 'x', brickwall: { budgets: { mdLines: 7 } } }),
    );
    const config = loadConfig(dir);
    expect(config.budgets.mdLines).toBe(7);
  });

  it('throws when both brickwall.config.json and package.json "brickwall" key exist', () => {
    dir = makeTmpDir();
    writeFileSync(join(dir, 'brickwall.config.json'), JSON.stringify({}));
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ name: 'x', brickwall: {} }),
    );
    expect(() => loadConfig(dir)).toThrow(BrickwallConfigError);
    expect(() => loadConfig(dir)).toThrow(/found both/);
  });

  it('throws BrickwallConfigError for an unreadable explicit --config path', () => {
    dir = makeTmpDir();
    expect(() => loadConfig(dir, join(dir, 'does-not-exist.json'))).toThrow(
      BrickwallConfigError,
    );
  });

  it('throws BrickwallConfigError for malformed JSON', () => {
    dir = makeTmpDir();
    writeFileSync(join(dir, 'brickwall.config.json'), '{ not valid json');
    expect(() => loadConfig(dir)).toThrow(BrickwallConfigError);
  });
});
