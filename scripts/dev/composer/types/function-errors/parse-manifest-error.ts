import type { ComposerManifestPathDuplicateError } from '../errors/composer-manifest-path-duplicate-error';
import type { ComposerManifestPathInvalidError } from '../errors/composer-manifest-path-invalid-error';

export type ParseManifestError =
  | ComposerManifestPathInvalidError
  | ComposerManifestPathDuplicateError;
