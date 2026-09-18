import { Result } from '@praha/byethrow';
import type { ValidateDirectorySectionFilesExistError } from '../../../types/function-errors/validate-directory-section-files-exist-error';

export function validateDirectorySectionFilesExist(item: {
  missingSectionFilePaths: string[];
}): Result.Result<void, ValidateDirectorySectionFilesExistError> {
  return item.missingSectionFilePaths.length > 0
    ? Result.fail({
        code: 'COMPOSER_DIRECTORY_SECTION_FILE_MISSING',
        message: `Directory requires section file ${item.missingSectionFilePaths[0]}`,
        path: item.missingSectionFilePaths[0]
      })
    : Result.succeed();
}
