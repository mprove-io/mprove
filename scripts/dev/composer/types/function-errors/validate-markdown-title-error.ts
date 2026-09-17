import type { ComposerMarkdownTitleMismatchError } from '../errors/composer-markdown-title-mismatch-error';
import type { ComposerSourceFileNameInvalidError } from '../errors/composer-source-file-name-invalid-error';
import type { ReadTextFileError } from './read-text-file-error';

export type ValidateMarkdownTitleError =
  | ComposerSourceFileNameInvalidError
  | ReadTextFileError
  | ComposerMarkdownTitleMismatchError;
