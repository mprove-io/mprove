import { type Stats, statSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ComposerError } from '../types/errors/composer-error';

export function validateSourceDirectory(item: {
  sourceDirectory: string;
}): Result.Result<void, ComposerError> {
  let { sourceDirectory } = item;

  return Result.pipe(
    Result.succeed(sourceDirectory),
    Result.andThen(path =>
      Result.try({
        try: (): Stats => statSync(path),
        catch: (error: unknown): ComposerError => ({
          code: 'COMPOSER_SOURCE_DIRECTORY_ACCESS_FAILED',
          message: `Unable to access ${path}`,
          path: path,
          originalError: error
        })
      })
    ),
    Result.andThen(sourceStats => {
      return sourceStats.isDirectory()
        ? Result.succeed()
        : Result.fail({
            code: 'COMPOSER_SOURCE_PATH_NOT_DIRECTORY',
            message: `Source path is not a directory: ${sourceDirectory}`,
            path: sourceDirectory
          });
    })
  );
}
