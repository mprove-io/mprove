import { writeFileSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ComposerError } from '../types/errors/composer-error';

export function writeOutput(item: {
  markdown: string;
  outputPath: string;
}): Result.Result<void, ComposerError> {
  let { markdown, outputPath } = item;

  return Result.try({
    try: (): void => writeFileSync(outputPath, `${markdown}\n`, 'utf8'),
    catch: (error: unknown): ComposerError => ({
      code: 'COMPOSER_OUTPUT_WRITE_FAILED',
      message: `Unable to write ${outputPath}`,
      outputPath: outputPath,
      originalError: error
    })
  });
}
