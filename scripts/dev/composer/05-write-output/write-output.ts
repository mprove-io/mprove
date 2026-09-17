import { randomUUID } from 'node:crypto';
import { renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ComposerError } from '../types/errors/composer-error';

export function writeOutput(item: {
  markdown: string;
  outputPath: string;
}): Result.Result<void, ComposerError> {
  let { markdown, outputPath } = item;

  let outputDirectory: string = dirname(outputPath);

  let outputFileName: string = basename(outputPath);

  let temporaryOutputPath: string = resolve(
    outputDirectory,
    `.${outputFileName}.${randomUUID()}.tmp`
  );

  return Result.try({
    try: (): void => {
      writeFileSync(temporaryOutputPath, `${markdown}\n`, 'utf8');

      renameSync(temporaryOutputPath, outputPath);
    },
    catch: (error: unknown): ComposerError => {
      try {
        rmSync(temporaryOutputPath, { force: true });
      } catch (cleanupError: unknown) {
        void cleanupError;
      }

      let composerError: ComposerError = {
        code: 'COMPOSER_OUTPUT_WRITE_FAILED',
        message: `Unable to write ${outputPath}`,
        outputPath: outputPath,
        originalError: error
      };

      return composerError;
    }
  });
}
