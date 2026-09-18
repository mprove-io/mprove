import { posix } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ParseManifestError } from '../../../types/function-errors/parse-manifest-error';
import type { Manifest } from '../../../types/manifest';

export function parseManifest(item: {
  content: string;
  manifestPath: string;
}): Result.Result<Manifest, ParseManifestError> {
  let { content, manifestPath } = item;

  let lines: string[] = content.split(/\r?\n/u);

  let relativePaths: string[] = [];

  let referencedPaths: Set<string> = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    let line: string = lines[i].trim();

    if (line.length === 0) {
      continue;
    }

    if (!line.startsWith('- ')) {
      return Result.fail({
        code: 'COMPOSER_MANIFEST_PATH_INVALID',
        message: `${manifestPath}:${i + 1} must contain a Markdown list item`,
        manifestPath: manifestPath
      });
    }

    let relativePath: string = line.slice(2).trim();

    let normalizedPath: string = posix.normalize(relativePath);

    if (
      /\s/u.test(relativePath) ||
      relativePath !== normalizedPath ||
      relativePath.startsWith('/') ||
      relativePath.startsWith('../') ||
      relativePath.includes('\\') ||
      posix.extname(relativePath) !== '.md'
    ) {
      return Result.fail({
        code: 'COMPOSER_MANIFEST_PATH_INVALID',
        message: `${manifestPath}:${i + 1} must contain a safe relative .md path as a Markdown list item`,
        manifestPath: manifestPath
      });
    }

    if (referencedPaths.has(relativePath)) {
      return Result.fail({
        code: 'COMPOSER_MANIFEST_PATH_DUPLICATE',
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
