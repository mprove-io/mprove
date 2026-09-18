import type { GetMarkdownFilePathsError } from './get-markdown-file-paths-error';
import type { ParseManifestError } from './parse-manifest-error';
import type { ReadTextFileError } from './read-text-file-error';
import type { ValidateManifestPathsError } from './validate-manifest-paths-error';
import type { ValidateMarkdownTitlesError } from './validate-markdown-titles-error';

export type LoadManifestError =
  | ReadTextFileError
  | ParseManifestError
  | GetMarkdownFilePathsError
  | ValidateManifestPathsError
  | ValidateMarkdownTitlesError;
