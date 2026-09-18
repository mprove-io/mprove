import type { ComposerIgnoredPathReferencedError } from '../errors/composer-ignored-path-referenced-error';
import type { ComposerManifestReferencesMissingFileError } from '../errors/composer-manifest-references-missing-file-error';
import type { ComposerMarkdownFileUnreferencedError } from '../errors/composer-markdown-file-unreferenced-error';

export type ValidateManifestPathsError =
  | ComposerIgnoredPathReferencedError
  | ComposerMarkdownFileUnreferencedError
  | ComposerManifestReferencesMissingFileError;
