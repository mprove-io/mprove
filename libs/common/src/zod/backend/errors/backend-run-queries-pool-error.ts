import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRunQueriesPoolError = {
  code: 'BACKEND_RUN_QUERIES_POOL_ERROR';
};

export let zBackendRunQueriesPoolError = z.object({
  code: z.literal('BACKEND_RUN_QUERIES_POOL_ERROR')
});

assertTypesEqual<
  BackendRunQueriesPoolError,
  z.infer<typeof zBackendRunQueriesPoolError>
>({ value: true });
