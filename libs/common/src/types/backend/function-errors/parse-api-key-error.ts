import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendWrongApiKeyFormatError,
  zBackendWrongApiKeyFormatError
} from '#common/types/backend/errors/backend-wrong-api-key-format-error';

export type ParseApiKeyError = BackendWrongApiKeyFormatError;

export const zParseApiKeyError = zBackendWrongApiKeyFormatError;

assertTypesEqual<ParseApiKeyError, z.infer<typeof zParseApiKeyError>>({
  value: true
});
