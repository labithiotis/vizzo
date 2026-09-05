import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

function wildcardToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
}

/**
 * Expands a single trailing wildcard segment (e.g. `./charts/*.json`).
 * Shells on Unix already expand globs before the CLI sees them; this only
 * covers the case where the pattern reaches us literally, such as on
 * Windows or when the pattern was quoted.
 */
export function expandGlobs(patterns: readonly string[]): string[] {
  return patterns.flatMap((pattern) => {
    if (!pattern.includes('*') && !pattern.includes('?')) return [pattern];
    const dir = dirname(pattern);
    const base = pattern.slice(dir.length + 1);
    const regex = wildcardToRegExp(base);
    return readdirSync(dir)
      .filter((name) => regex.test(name))
      .sort()
      .map((name) => join(dir, name));
  });
}
