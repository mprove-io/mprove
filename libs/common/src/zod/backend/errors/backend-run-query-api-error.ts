import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRunQueryApiError = {
  code: 'BACKEND_RUN_QUERY_API_ERROR';
};

export let zBackendRunQueryApiError = z.object({
  code: z.literal('BACKEND_RUN_QUERY_API_ERROR')
});

assertTypesEqual<
  BackendRunQueryApiError,
  z.infer<typeof zBackendRunQueryApiError>
>({ value: true });
