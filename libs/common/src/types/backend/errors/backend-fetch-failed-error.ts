import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchFailedError = {
  code: 'BACKEND_FETCH_FAILED';
};

export let zBackendFetchFailedError = z.object({
  code: z.literal('BACKEND_FETCH_FAILED')
});

assertTypesEqual<
  BackendFetchFailedError,
  z.infer<typeof zBackendFetchFailedError>
>({ value: true });
