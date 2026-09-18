import type { CreateMarkdownError } from './create-markdown-error';
import type { LoadManifestError } from './load-manifest-error';
import type { ValidateInputError } from './validate-input-error';
import type { WriteOutputError } from './write-output-error';

export type ComposeError =
  | ValidateInputError
  | LoadManifestError
  | CreateMarkdownError
  | WriteOutputError;
