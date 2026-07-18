import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BrickwallConfigError, type BrickwallConfig } from './defaults.js';
import { validateAndMergeConfig } from './validate.js';

// Stable import surface: types + defaults live in defaults.ts, pure
// validation in validate.ts, IO here — consumers import from one place.
export {
  BrickwallConfigError,
  DEFAULT_CONFIG,
  type BrickwallConfig,
  type CodeConfig,
  type DocsConfig,
} from './defaults.js';
export { validateAndMergeConfig } from './validate.js';

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
