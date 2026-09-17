import type { ComposerDirectorySectionFileMissingError } from '../errors/composer-directory-section-file-missing-error';
import type { ComposerDirectorySectionScanFailedError } from '../errors/composer-directory-section-scan-failed-error';

export type ValidateDirectorySectionFilesError =
  | ComposerDirectorySectionScanFailedError
  | ComposerDirectorySectionFileMissingError;
