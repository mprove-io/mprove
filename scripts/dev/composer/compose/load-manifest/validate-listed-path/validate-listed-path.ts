import { posix, win32 } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ValidateListedPathError } from '../../../types/function-errors/validate-listed-path-error';
import type { ManifestLine } from '../../../types/manifest-line';

export function validateListedPath(item: {
  listedPath: string;
  manifestLine: ManifestLine;
  manifestPath: string;
}): Result.Result<void, ValidateListedPathError> {
  let { listedPath, manifestLine, manifestPath } = item;

  let normalizedPath: string = posix.normalize(listedPath);

  if (
    /\s/u.test(listedPath) ||
    listedPath !== normalizedPath ||
    posix.isAbsolute(listedPath) ||
    win32.isAbsolute(listedPath) ||
    listedPath.startsWith('../') ||
    listedPath.includes('\\') ||
    posix.extname(listedPath) !== '.md'
  ) {
    return Result.fail({
      code: 'COMPOSER_MANIFEST_PATH_INVALID',
      message: `${manifestPath}:${manifestLine.lineNumber} must contain a safe relative .md path as a Markdown list item`,
      manifestPath: manifestPath
    });
  }

  return Result.succeed();
}
