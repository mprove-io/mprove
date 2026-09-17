import type { ParseManifestError } from './parse-manifest-error';
import type { ReadTextFileError } from './read-text-file-error';
import type { ValidateManifestError } from './validate-manifest-error';

export type LoadManifestError =
  | ReadTextFileError
  | ParseManifestError
  | ValidateManifestError;
