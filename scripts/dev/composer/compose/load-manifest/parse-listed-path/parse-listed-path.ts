import { Result } from '@praha/byethrow';
import type { ParseListedPathError } from '../../../types/function-errors/parse-listed-path-error';
import type { ManifestLine } from '../../../types/manifest-line';

export function parseListedPath(item: {
  manifestLine: ManifestLine;
  manifestPath: string;
}): Result.Result<string, ParseListedPathError> {
  let { manifestLine, manifestPath } = item;

  if (!manifestLine.line.startsWith('- ')) {
    return Result.fail({
      code: 'COMPOSER_MANIFEST_PATH_INVALID',
      message: `${manifestPath}:${manifestLine.lineNumber} must contain a Markdown list item`,
      manifestPath: manifestPath
    });
  }

  let listedPath: string = manifestLine.line.slice(2).trim();

  return Result.succeed(listedPath);
}
