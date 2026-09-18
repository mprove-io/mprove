import type { ComposerContentDirectoryAccessFailedError } from '../errors/composer-content-directory-access-failed-error';
import type { ComposerContentPathNotDirectoryError } from '../errors/composer-content-path-not-directory-error';

export type ValidateContentDirectoryError =
  | ComposerContentDirectoryAccessFailedError
  | ComposerContentPathNotDirectoryError;
