import type { GetContentStatsError } from './get-content-stats-error';
import type { ValidateArgumentCountError } from './validate-argument-count-error';
import type { ValidateContentPathIsDirectoryError } from './validate-content-path-is-directory-error';
import type { ValidateManifestOutputPathConflictError } from './validate-manifest-output-path-conflict-error';
import type { ValidateManifestPathOutsideContentDirectoryError } from './validate-manifest-path-outside-content-directory-error';
import type { ValidateOutputPathOutsideContentDirectoryError } from './validate-output-path-outside-content-directory-error';

export type ValidateInputError =
  | ValidateArgumentCountError
  | ValidateManifestOutputPathConflictError
  | ValidateManifestPathOutsideContentDirectoryError
  | ValidateOutputPathOutsideContentDirectoryError
  | GetContentStatsError
  | ValidateContentPathIsDirectoryError;
