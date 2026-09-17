import { type Stats, statSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ComposerError } from '../types/errors/composer-error';

export function validateSourceDirectory(item: {
  sourceDirectory: string;
}): Result.Result<void, ComposerError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('sourceStats', v =>
      Result.try({
        try: (): Stats => statSync(v.sourceDirectory),
        catch: (error: unknown): ComposerError => ({
          code: 'COMPOSER_SOURCE_DIRECTORY_ACCESS_FAILED',
          message: `Unable to access ${v.sourceDirectory}`,
          path: v.sourceDirectory,
          originalError: error
        })
      })
    ),
    Result.andThen(v => {
      let sourceIsDirectory: boolean = v.sourceStats.isDirectory();

      return sourceIsDirectory
        ? Result.succeed()
        : Result.fail({
            code: 'COMPOSER_SOURCE_PATH_NOT_DIRECTORY',
            message: `Source path is not a directory: ${v.sourceDirectory}`,
            path: v.sourceDirectory
          });
    })
  );
}
