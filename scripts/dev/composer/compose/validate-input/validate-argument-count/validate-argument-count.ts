import { Result } from '@praha/byethrow';
import type { ValidateArgumentCountError } from '../../../types/function-errors/validate-argument-count-error';

export function validateArgumentCount(item: {
  argv: string[];
}): Result.Result<void, ValidateArgumentCountError> {
  return item.argv.length === 3
    ? Result.succeed()
    : Result.fail({
        code: 'COMPOSER_ARGUMENT_COUNT_INVALID',
        message:
          'Usage: pnpm composer <manifest-path> <content-directory> <output-file>'
      });
}
