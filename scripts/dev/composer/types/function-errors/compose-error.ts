import type { ComposerArgumentCountInvalidError } from '../errors/composer-argument-count-invalid-error';
import type { ComposerManifestOutputPathConflictError } from '../errors/composer-manifest-output-path-conflict-error';
import type { CreateMarkdownError } from './create-markdown-error';
import type { LoadManifestError } from './load-manifest-error';
import type { ValidateDirectorySectionFilesError } from './validate-directory-section-files-error';
import type { ValidateSourceDirectoryError } from './validate-source-directory-error';
import type { WriteOutputError } from './write-output-error';

export type ComposeError =
  | ComposerArgumentCountInvalidError
  | ComposerManifestOutputPathConflictError
  | ValidateSourceDirectoryError
  | ValidateDirectorySectionFilesError
  | LoadManifestError
  | CreateMarkdownError
  | WriteOutputError;
