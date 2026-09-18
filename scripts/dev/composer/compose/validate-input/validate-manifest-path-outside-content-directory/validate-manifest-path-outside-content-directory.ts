import { Result } from '@praha/byethrow';
import { isPathInDirectory } from '../../../shared/is-path-in-directory/is-path-in-directory';
import type { ValidateManifestPathOutsideContentDirectoryError } from '../../../types/function-errors/validate-manifest-path-outside-content-directory-error';

export function validateManifestPathOutsideContentDirectory(item: {
  contentDirectory: string;
  manifestPath: string;
}): Result.Result<void, ValidateManifestPathOutsideContentDirectoryError> {
  let { contentDirectory, manifestPath } = item;

  if (
    isPathInDirectory({
      directoryPath: contentDirectory,
      path: manifestPath
    })
  ) {
    return Result.fail({
      code: 'COMPOSER_MANIFEST_PATH_IN_CONTENT_DIRECTORY',
      message: `Manifest path must be outside the content directory: ${manifestPath}`,
      path: manifestPath
    });
  }

  return Result.succeed();
}
