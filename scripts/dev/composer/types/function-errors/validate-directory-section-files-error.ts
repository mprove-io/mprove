import type { ComposerDirectorySectionFileMissingError } from '../errors/composer-directory-section-file-missing-error';
import type { GetMissingDirectorySectionFilePathsError } from './get-missing-directory-section-file-paths-error';

export type ValidateDirectorySectionFilesError =
  | GetMissingDirectorySectionFilePathsError
  | ComposerDirectorySectionFileMissingError;
