import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRunQueryTrinoError = {
  code: 'BACKEND_RUN_QUERY_TRINO_ERROR';
};

export let zBackendRunQueryTrinoError = z.object({
  code: z.literal('BACKEND_RUN_QUERY_TRINO_ERROR')
});

assertTypesEqual<
  BackendRunQueryTrinoError,
  z.infer<typeof zBackendRunQueryTrinoError>
>({ value: true });
