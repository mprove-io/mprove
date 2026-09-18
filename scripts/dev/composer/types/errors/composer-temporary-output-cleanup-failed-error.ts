import type { ComposerOutputWriteFailedError } from './composer-output-write-failed-error';

export type ComposerTemporaryOutputCleanupFailedError = {
  code: 'COMPOSER_TEMPORARY_OUTPUT_CLEANUP_FAILED';
  message: string;
  outputPath: string;
  temporaryOutputPath: string;
  writeError: ComposerOutputWriteFailedError;
  originalError: unknown;
};
