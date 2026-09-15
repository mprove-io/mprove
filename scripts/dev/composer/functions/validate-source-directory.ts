import { type Stats, statSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ScriptError } from '../types/errors/script-error';

export function validateSourceDirectory(item: {
  sourceDirectory: string;
}): Result.Result<void, ScriptError> {
  let { sourceDirectory } = item;

  return Result.pipe(
    Result.succeed(sourceDirectory),
    Result.andThen(path =>
      Result.try({
        try: (): Stats => statSync(path),
        catch: (error: unknown): ScriptError => ({
          code: 'SCRIPT_SOURCE_ERROR',
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
            code: 'SCRIPT_SOURCE_ERROR',
            message: `Source path is not a directory: ${sourceDirectory}`,
            path: sourceDirectory
          });
    })
  );
}
