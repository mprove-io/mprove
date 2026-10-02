import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchConstraintsDuckdbError = {
  code: 'BACKEND_FETCH_CONSTRAINTS_DUCKDB_ERROR';
};

export let zBackendFetchConstraintsDuckdbError = z.object({
  code: z.literal('BACKEND_FETCH_CONSTRAINTS_DUCKDB_ERROR')
});

assertTypesEqual<
  BackendFetchConstraintsDuckdbError,
  z.infer<typeof zBackendFetchConstraintsDuckdbError>
>({ value: true });
