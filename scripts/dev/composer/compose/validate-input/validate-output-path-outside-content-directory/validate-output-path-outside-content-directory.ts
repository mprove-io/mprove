import { Result } from '@praha/byethrow';
import { isPathInDirectory } from '../../../shared/is-path-in-directory/is-path-in-directory';
import type { ValidateOutputPathOutsideContentDirectoryError } from '../../../types/function-errors/validate-output-path-outside-content-directory-error';

export function validateOutputPathOutsideContentDirectory(item: {
  contentDirectory: string;
  outputPath: string;
}): Result.Result<void, ValidateOutputPathOutsideContentDirectoryError> {
  let { contentDirectory, outputPath } = item;

  if (
    isPathInDirectory({
      directoryPath: contentDirectory,
      path: outputPath
    })
  ) {
    return Result.fail({
      code: 'COMPOSER_OUTPUT_PATH_IN_CONTENT_DIRECTORY',
      message: `Output path must be outside the content directory: ${outputPath}`,
      path: outputPath
    });
  }

  return Result.succeed();
}
