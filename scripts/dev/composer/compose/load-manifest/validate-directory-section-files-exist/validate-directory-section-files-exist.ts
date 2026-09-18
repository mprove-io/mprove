import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ValidateDirectorySectionFilesExistError } from '../../../types/function-errors/validate-directory-section-files-exist-error';

export function validateDirectorySectionFilesExist(item: {
  contentDirectory: string;
  directoryRelativePaths: string[];
  markdownRelativePaths: string[];
}): Result.Result<void, ValidateDirectorySectionFilesExistError> {
  let markdownRelativePaths: Set<string> = new Set<string>(
    item.markdownRelativePaths
  );

  let missingSectionRelativePaths: string[] = item.directoryRelativePaths
    .map(relativePath => `${relativePath}.md`)
    .filter(relativePath => !markdownRelativePaths.has(relativePath));

  if (missingSectionRelativePaths.length > 0) {
    let sectionFilePath: string = resolve(
      item.contentDirectory,
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
