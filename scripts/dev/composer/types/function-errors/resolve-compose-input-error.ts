import type { ComposerArgumentCountInvalidError } from '../errors/composer-argument-count-invalid-error';
import type { ComposerManifestOutputPathConflictError } from '../errors/composer-manifest-output-path-conflict-error';

export type ResolveComposeInputError =
  | ComposerArgumentCountInvalidError
  | ComposerManifestOutputPathConflictError;
