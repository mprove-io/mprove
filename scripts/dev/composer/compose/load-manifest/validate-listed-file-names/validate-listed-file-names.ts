import { posix, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ValidateListedFileNamesError } from '../../../types/function-errors/validate-listed-file-names-error';

export function validateListedFileNames(item: {
  contentDirectory: string;
  listedPaths: string[];
}): Result.Result<void, ValidateListedFileNamesError> {
  let { contentDirectory, listedPaths } = item;

  for (let i = 0; i < listedPaths.length; i++) {
    let listedPath: string = listedPaths[i];

    let filePath: string = resolve(contentDirectory, listedPath);

    let fileNameStem: string = posix.basename(listedPath, '.md');

    if (!/^[a-z0-9-]+$/u.test(fileNameStem)) {
      return Result.fail({
        code: 'COMPOSER_LISTED_FILE_NAME_INVALID',
        message: `${filePath} filename may contain only lowercase a-z, 0-9, and hyphens`,
        filePath: filePath
      });
    }
  }

  return Result.succeed();
}
