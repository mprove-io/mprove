import { readFileSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ScriptError } from '../../types/errors/script-error';

export function readTextFile(item: {
  filePath: string;
}): Result.Result<string, ScriptError> {
  let { filePath } = item;

  return Result.try({
    try: (): string => readFileSync(filePath, 'utf8'),
    catch: (error: unknown): ScriptError => ({
      code: 'SCRIPT_SOURCE_ERROR',
      message: `Unable to read ${filePath}`,
      path: filePath,
      originalError: error
    })
  });
}
