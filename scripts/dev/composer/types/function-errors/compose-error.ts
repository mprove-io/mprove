import type { CreateMarkdownError } from './create-markdown-error';
import type { LoadManifestError } from './load-manifest-error';
import type { ResolveComposeInputError } from './resolve-compose-input-error';
import type { ValidateContentDirectoryError } from './validate-content-directory-error';
import type { ValidateDirectorySectionFilesError } from './validate-directory-section-files-error';
import type { WriteOutputError } from './write-output-error';

export type ComposeError =
  | ResolveComposeInputError
  | ValidateContentDirectoryError
  | ValidateDirectorySectionFilesError
  | LoadManifestError
  | CreateMarkdownError
  | WriteOutputError;
