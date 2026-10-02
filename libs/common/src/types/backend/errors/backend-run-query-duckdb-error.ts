import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRunQueryDuckdbError = {
  code: 'BACKEND_RUN_QUERY_DUCKDB_ERROR';
};

export let zBackendRunQueryDuckdbError = z.object({
  code: z.literal('BACKEND_RUN_QUERY_DUCKDB_ERROR')
});

assertTypesEqual<
  BackendRunQueryDuckdbError,
  z.infer<typeof zBackendRunQueryDuckdbError>
>({ value: true });
