import type { ComposerMarkdownTitleMismatchError } from '../errors/composer-markdown-title-mismatch-error';
import type { ComposerSourceFileNameInvalidError } from '../errors/composer-source-file-name-invalid-error';

export type ValidateMarkdownTitlesError =
  | ComposerSourceFileNameInvalidError
  | ComposerMarkdownTitleMismatchError;
