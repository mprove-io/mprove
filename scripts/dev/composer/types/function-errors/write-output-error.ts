import type { ComposerOutputWriteFailedError } from '../errors/composer-output-write-failed-error';
import type { ComposerTemporaryOutputCleanupFailedError } from '../errors/composer-temporary-output-cleanup-failed-error';

export type WriteOutputError =
  | ComposerOutputWriteFailedError
  | ComposerTemporaryOutputCleanupFailedError;
