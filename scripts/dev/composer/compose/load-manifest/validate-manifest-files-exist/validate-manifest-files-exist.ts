import { Result } from '@praha/byethrow';
import type { ValidateManifestFilesExistError } from '../../../types/function-errors/validate-manifest-files-exist-error';

export function validateManifestFilesExist(item: {
  manifestRelativePaths: string[];
  markdownRelativePaths: string[];
}): Result.Result<void, ValidateManifestFilesExistError> {
  let markdownRelativePaths: Set<string> = new Set<string>(
    item.markdownRelativePaths
  );

  let missingRelativePaths: string[] = item.manifestRelativePaths.filter(
    relativePath => !markdownRelativePaths.has(relativePath)
  );

  return missingRelativePaths.length > 0
    ? Result.fail({
        code: 'COMPOSER_MANIFEST_REFERENCES_MISSING_FILE',
        message: `The manifest references missing Markdown file ${missingRelativePaths[0]}`,
        path: missingRelativePaths[0]
      })
    : Result.succeed();
}
