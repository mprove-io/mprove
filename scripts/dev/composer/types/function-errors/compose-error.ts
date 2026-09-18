import type { LoadManifestError } from './load-manifest-error';
import type { ReadTextFileError } from './read-text-file-error';
import type { ValidateInputError } from './validate-input-error';
import type { ValidateMarkdownTitlesError } from './validate-markdown-titles-error';
import type { WriteOutputError } from './write-output-error';

export type ComposeError =
  | ValidateInputError
  | LoadManifestError
  | ReadTextFileError
  | ValidateMarkdownTitlesError
  | WriteOutputError;
