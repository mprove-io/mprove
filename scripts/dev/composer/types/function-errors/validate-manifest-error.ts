import type { ComposerIgnoredPathReferencedError } from '../errors/composer-ignored-path-referenced-error';
import type { ComposerManifestReferencesMissingFileError } from '../errors/composer-manifest-references-missing-file-error';
import type { ComposerMarkdownFileUnreferencedError } from '../errors/composer-markdown-file-unreferenced-error';
import type { GetMarkdownFilePathsError } from './get-markdown-file-paths-error';
import type { ValidateMarkdownTitleError } from './validate-markdown-title-error';

export type ValidateManifestError =
  | GetMarkdownFilePathsError
  | ComposerIgnoredPathReferencedError
  | ComposerMarkdownFileUnreferencedError
  | ComposerManifestReferencesMissingFileError
  | ValidateMarkdownTitleError;
