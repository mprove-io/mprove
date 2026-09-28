import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchFkDuckdbError = {
  code: 'BACKEND_FETCH_FK_DUCKDB_ERROR';
};

export let zBackendFetchFkDuckdbError = z.object({
  code: z.literal('BACKEND_FETCH_FK_DUCKDB_ERROR')
});

assertTypesEqual<
  BackendFetchFkDuckdbError,
  z.infer<typeof zBackendFetchFkDuckdbError>
>({ value: true });
