import type { McliApiKeyInvalidFormatError } from '#mcli/types/errors/mcli-api-key-invalid-format-error';
import type { McliApiKeyIsNotDefinedError } from '#mcli/types/errors/mcli-api-key-is-not-defined-error';

export type GetApiKeyRepoIdError =
  | McliApiKeyIsNotDefinedError
  | McliApiKeyInvalidFormatError;
