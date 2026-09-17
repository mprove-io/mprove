import { readFileSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ComposerTextFileReadFailedError } from '../../types/errors/composer-text-file-read-failed-error';
import type { ReadTextFileError } from '../../types/function-errors/read-text-file-error';

export function readTextFile(item: {
  filePath: string;
}): Result.Result<string, ReadTextFileError> {
  let { filePath } = item;

  return Result.try({
    try: (): string => readFileSync(filePath, 'utf8'),
    catch: (error: unknown): ComposerTextFileReadFailedError => ({
      code: 'COMPOSER_TEXT_FILE_READ_FAILED',
      message: `Unable to read ${filePath}`,
      path: filePath,
      originalError: error
    })
  });
}
