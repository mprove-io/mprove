import type { ComposerSourceDirectoryAccessFailedError } from '../errors/composer-source-directory-access-failed-error';
import type { ComposerSourcePathNotDirectoryError } from '../errors/composer-source-path-not-directory-error';

export type ValidateSourceDirectoryError =
  | ComposerSourceDirectoryAccessFailedError
  | ComposerSourcePathNotDirectoryError;
