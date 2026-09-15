import { writeFileSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ScriptError } from '../types/errors/script-error';

export function writeOutput(item: {
  markdown: string;
  outputPath: string;
}): Result.Result<void, ScriptError> {
  let { markdown, outputPath } = item;

  return Result.try({
    try: (): void => writeFileSync(outputPath, `${markdown}\n`, 'utf8'),
    catch: (error: unknown): ScriptError => ({
      code: 'SCRIPT_OUTPUT_WRITE_ERROR',
      message: `Unable to write ${outputPath}`,
      outputPath: outputPath,
      originalError: error
    })
  });
}
