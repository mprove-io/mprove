import { readFileSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ComposerError } from '../../types/errors/composer-error';

export function readTextFile(item: {
  filePath: string;
}): Result.Result<string, ComposerError> {
  let { filePath } = item;

  return Result.try({
    try: (): string => readFileSync(filePath, 'utf8'),
    catch: (error: unknown): ComposerError => ({
      code: 'COMPOSER_TEXT_FILE_READ_FAILED',
      message: `Unable to read ${filePath}`,
      path: filePath,
      originalError: error
    })
  });
}
