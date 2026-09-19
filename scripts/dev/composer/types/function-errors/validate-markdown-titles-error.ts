import type { ComposerMarkdownH1MissingError } from '../errors/composer-markdown-h1-missing-error';
import type { ComposerMarkdownTitleMismatchError } from '../errors/composer-markdown-title-mismatch-error';

export type ValidateMarkdownTitlesError =
  | ComposerMarkdownH1MissingError
  | ComposerMarkdownTitleMismatchError;
