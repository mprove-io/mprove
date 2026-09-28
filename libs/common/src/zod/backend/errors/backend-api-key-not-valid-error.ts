import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendApiKeyNotValidError = {
  code: 'BACKEND_API_KEY_NOT_VALID';
};

export let zBackendApiKeyNotValidError = z.object({
  code: z.literal('BACKEND_API_KEY_NOT_VALID')
});

assertTypesEqual<
  BackendApiKeyNotValidError,
  z.infer<typeof zBackendApiKeyNotValidError>
>({ value: true });
