import type { ComposerArgumentCountInvalidError } from '../errors/composer-argument-count-invalid-error';
import type { ComposerManifestOutputPathConflictError } from '../errors/composer-manifest-output-path-conflict-error';
import type { ComposerManifestPathInContentDirectoryError } from '../errors/composer-manifest-path-in-content-directory-error';
import type { ComposerOutputPathInContentDirectoryError } from '../errors/composer-output-path-in-content-directory-error';

export type ResolveComposeInputError =
  | ComposerArgumentCountInvalidError
  | ComposerManifestOutputPathConflictError
  | ComposerManifestPathInContentDirectoryError
  | ComposerOutputPathInContentDirectoryError;
