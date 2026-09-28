import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchTimeoutError = {
  code: 'BACKEND_FETCH_TIMEOUT';
};

export let zBackendFetchTimeoutError = z.object({
  code: z.literal('BACKEND_FETCH_TIMEOUT')
});

assertTypesEqual<
  BackendFetchTimeoutError,
  z.infer<typeof zBackendFetchTimeoutError>
>({ value: true });
