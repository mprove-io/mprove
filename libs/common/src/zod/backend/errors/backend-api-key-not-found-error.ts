import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendApiKeyNotFoundError = {
  code: 'BACKEND_API_KEY_NOT_FOUND';
};

export let zBackendApiKeyNotFoundError = z.object({
  code: z.literal('BACKEND_API_KEY_NOT_FOUND')
});

assertTypesEqual<
  BackendApiKeyNotFoundError,
  z.infer<typeof zBackendApiKeyNotFoundError>
>({ value: true });
