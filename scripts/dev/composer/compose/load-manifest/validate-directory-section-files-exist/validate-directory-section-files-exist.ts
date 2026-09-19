import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { DiscoverPathsPayload } from '../../../types/discover-paths-payload';
import type { ValidateDirectorySectionFilesExistError } from '../../../types/function-errors/validate-directory-section-files-exist-error';

export function validateDirectorySectionFilesExist(item: {
  contentDirectory: string;
  discoverPathsPayload: DiscoverPathsPayload;
}): Result.Result<void, ValidateDirectorySectionFilesExistError> {
  let { contentDirectory, discoverPathsPayload } = item;

  let discoveredFiles: Set<string> = new Set<string>(
    discoverPathsPayload.files
  );

  let missingSectionRelativePaths: string[] = discoverPathsPayload.directories
    .map(relativePath => `${relativePath}.md`)
    .filter(relativePath => !discoveredFiles.has(relativePath));

  if (missingSectionRelativePaths.length > 0) {
    let sectionFilePath: string = resolve(
      contentDirectory,
      missingSectionRelativePaths[0]
    );

    return Result.fail({
      code: 'COMPOSER_DIRECTORY_SECTION_FILE_MISSING',
      message: `Directory requires section file ${sectionFilePath}`,
      path: sectionFilePath
    });
  }

  return Result.succeed();
}
