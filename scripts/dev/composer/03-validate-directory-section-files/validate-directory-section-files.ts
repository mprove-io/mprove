import { Result } from '@praha/byethrow';
import type { ComposerDirectorySectionFileMissingError } from '../types/errors/composer-directory-section-file-missing-error';
import type { GetMissingDirectorySectionFilePathsError } from '../types/function-errors/get-missing-directory-section-file-paths-error';
import type { ValidateDirectorySectionFilesError } from '../types/function-errors/validate-directory-section-files-error';
import { getMissingDirectorySectionFilePaths } from './001-get-missing-directory-section-file-paths/get-missing-directory-section-file-paths';

export function validateDirectorySectionFiles(item: {
  sourceDirectory: string;
}): Result.Result<void, ValidateDirectorySectionFilesError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'missingSectionFilePaths',
      (v): Result.Result<string[], GetMissingDirectorySectionFilePathsError> =>
        getMissingDirectorySectionFilePaths({
          sourceDirectory: v.sourceDirectory
        })
    ),
    Result.andThen(
      (v): Result.Result<void, ComposerDirectorySectionFileMissingError> => {
        let hasMissingSectionFile: boolean =
          v.missingSectionFilePaths.length > 0;

        return hasMissingSectionFile
          ? Result.fail({
              code: 'COMPOSER_DIRECTORY_SECTION_FILE_MISSING',
              message: `Directory requires section file ${v.missingSectionFilePaths[0]}`,
              path: v.missingSectionFilePaths[0]
            })
          : Result.succeed();
      }
    )
  );
}
