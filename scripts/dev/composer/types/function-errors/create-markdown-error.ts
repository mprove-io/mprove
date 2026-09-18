import type { ReadTextFileError } from './read-text-file-error';
import type { ValidateMarkdownTitlesError } from './validate-markdown-titles-error';

export type CreateMarkdownError =
  | ReadTextFileError
  | ValidateMarkdownTitlesError;
