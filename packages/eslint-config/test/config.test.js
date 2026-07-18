import { describe, expect, it } from 'vitest';
import config from '../index.js';

describe('@ianrios/eslint-config', () => {
  it('is a flat-config array', () => {
    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(3);
  });

  it('scopes every type-checked entry to ts/tsx files', () => {
    const typeChecked = config.filter((c) =>
      Object.keys(c.rules ?? {}).some((r) => r.startsWith('@typescript-eslint/')),
    );
    expect(typeChecked.length).toBeGreaterThan(0);
    for (const entry of typeChecked) {
      expect(entry.files).toEqual(['**/*.{ts,tsx}']);
    }
  });

  it('ships projectService so type-aware rules work without repo wiring', () => {
    const wired = config.some(
      (c) => c.languageOptions?.parserOptions?.projectService === true,
    );
    expect(wired).toBe(true);
  });

  it('carries the proven hard-line rules', () => {
    const rules = Object.assign({}, ...config.map((c) => c.rules ?? {}));
    expect(rules['@typescript-eslint/no-explicit-any']).toBe('error');
    expect(rules['@typescript-eslint/no-floating-promises']).toBe('error');
    expect(rules['@typescript-eslint/no-non-null-assertion']).toBe('error');
    expect(rules['max-len'][0]).toBe('error');
    expect(rules['max-len'][1].code).toBe(80);
    expect(rules['no-console'][0]).toBe('warn');
  });

  it('leaves framework choices to the consumer: no react/a11y/browser globals', () => {
    const pluginNames = config.flatMap((c) => Object.keys(c.plugins ?? {}));
    const ruleNames = config.flatMap((c) => Object.keys(c.rules ?? {}));
    for (const name of [...pluginNames, ...ruleNames]) {
      expect(name).not.toMatch(/react|jsx-a11y|testing-library/);
    }
    const browserGlobals = config.some(
      (c) => c.languageOptions?.globals?.window !== undefined,
    );
    expect(browserGlobals).toBe(false);
  });
});
