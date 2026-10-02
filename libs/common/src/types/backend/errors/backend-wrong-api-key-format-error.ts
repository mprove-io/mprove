import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongApiKeyFormatError = {
  code: 'BACKEND_WRONG_API_KEY_FORMAT';
};

export let zBackendWrongApiKeyFormatError = z.object({
  code: z.literal('BACKEND_WRONG_API_KEY_FORMAT')
});

assertTypesEqual<
  BackendWrongApiKeyFormatError,
  z.infer<typeof zBackendWrongApiKeyFormatError>
>({ value: true });
