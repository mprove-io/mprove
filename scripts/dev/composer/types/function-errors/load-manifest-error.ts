import type { GetContentPathsError } from './get-content-paths-error';
import type { ParseManifestError } from './parse-manifest-error';
import type { ReadTextFileError } from './read-text-file-error';
import type { ValidateDirectorySectionFilesExistError } from './validate-directory-section-files-exist-error';
import type { ValidateManifestFilesExistError } from './validate-manifest-files-exist-error';
import type { ValidateMarkdownFilesReferencedError } from './validate-markdown-files-referenced-error';

export type LoadManifestError =
  | ReadTextFileError
  | ParseManifestError
  | GetContentPathsError
  | ValidateDirectorySectionFilesExistError
  | ValidateManifestFilesExistError
  | ValidateMarkdownFilesReferencedError;
