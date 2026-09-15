import { posix } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ScriptError } from '../../types/errors/script-error';
import type { Manifest } from '../../types/manifest';

export function parseManifest(item: {
  content: string;
  manifestPath: string;
}): Result.Result<Manifest, ScriptError> {
  let { content, manifestPath } = item;

  let lines: string[] = content.split(/\r?\n/u);

  let relativePaths: string[] = [];

  let referencedPaths: Set<string> = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    let relativePath: string = lines[i].trim();

    if (relativePath.length === 0) {
      continue;
    }

    let normalizedPath: string = posix.normalize(relativePath);

    let pathIsSafe: boolean =
      relativePath === normalizedPath &&
      !relativePath.startsWith('/') &&
      !relativePath.startsWith('../') &&
      !relativePath.includes('\\') &&
      posix.extname(relativePath) === '.md';

    if (!pathIsSafe) {
      return Result.fail({
        code: 'SCRIPT_INVALID_MANIFEST_ERROR',
        message: `${manifestPath}:${i + 1} must contain a safe relative .md path`,
        manifestPath: manifestPath
      });
    }

    let isDuplicate: boolean = referencedPaths.has(relativePath);

    if (isDuplicate) {
      return Result.fail({
        code: 'SCRIPT_MARKDOWN_REFERENCE_ERROR',
        message: `${manifestPath}:${i + 1} references ${relativePath} more than once`,
        path: relativePath
      });
    }

    referencedPaths.add(relativePath);

    relativePaths.push(relativePath);
  }

  let manifest: Manifest = {
    relativePaths: relativePaths
  };

  return Result.succeed(manifest);
}
