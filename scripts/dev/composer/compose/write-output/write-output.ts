import { randomUUID } from 'node:crypto';
import { renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ComposerOutputWriteFailedError } from '../../types/errors/composer-output-write-failed-error';
import type { ComposerTemporaryOutputCleanupFailedError } from '../../types/errors/composer-temporary-output-cleanup-failed-error';
import type { WriteOutputError } from '../../types/function-errors/write-output-error';

export function writeOutput(item: {
  markdown: string;
  outputPath: string;
}): Result.Result<void, WriteOutputError> {
  let { markdown, outputPath } = item;

  let outputDirectory: string = dirname(outputPath);

  let outputFileName: string = basename(outputPath);

  let temporaryOutputPath: string = resolve(
    outputDirectory,
    `.${outputFileName}.${randomUUID()}.tmp`
  );

  return Result.pipe(
    Result.succeed({
      markdown: markdown,
      outputPath: outputPath,
      temporaryOutputPath: temporaryOutputPath
    }),
    Result.andThrough(v =>
      Result.try({
        try: (): void => {
          writeFileSync(v.temporaryOutputPath, `${v.markdown}\n`, 'utf8');

          renameSync(v.temporaryOutputPath, v.outputPath);
        },
        catch: (error: unknown): ComposerOutputWriteFailedError => {
          let writeOutputError: ComposerOutputWriteFailedError = {
            code: 'COMPOSER_OUTPUT_WRITE_FAILED',
            message: `Unable to write ${v.outputPath}`,
            outputPath: v.outputPath,
            temporaryOutputPath: v.temporaryOutputPath,
            originalError: error
          };

          return writeOutputError;
        }
      })
    ),
    Result.orThrough(v =>
      Result.try({
        try: (): void => {
          rmSync(v.temporaryOutputPath, { force: true });
        },
        catch: (error: unknown): ComposerTemporaryOutputCleanupFailedError => {
          let cleanupOutputError: ComposerTemporaryOutputCleanupFailedError = {
            code: 'COMPOSER_TEMPORARY_OUTPUT_CLEANUP_FAILED',
            message: `Unable to remove temporary output ${v.temporaryOutputPath} after failing to write ${v.outputPath}`,
            outputPath: v.outputPath,
            temporaryOutputPath: v.temporaryOutputPath,
            writeError: v,
            originalError: error
          };

          return cleanupOutputError;
        }
      })
    ),
    Result.map((): void => {})
  );
}
