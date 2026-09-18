import type { CreateMarkdownError } from './create-markdown-error';
import type { LoadManifestError } from './load-manifest-error';
import type { ResolveComposeInputError } from './resolve-compose-input-error';
import type { ValidateDirectorySectionFilesError } from './validate-directory-section-files-error';
import type { ValidateSourceDirectoryError } from './validate-source-directory-error';
import type { WriteOutputError } from './write-output-error';

export type ComposeError =
  | ResolveComposeInputError
  | ValidateSourceDirectoryError
  | ValidateDirectorySectionFilesError
  | LoadManifestError
  | CreateMarkdownError
  | WriteOutputError;
