import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchFkDatabricksError = {
  code: 'BACKEND_FETCH_FK_DATABRICKS_ERROR';
};

export let zBackendFetchFkDatabricksError = z.object({
  code: z.literal('BACKEND_FETCH_FK_DATABRICKS_ERROR')
});

assertTypesEqual<
  BackendFetchFkDatabricksError,
  z.infer<typeof zBackendFetchFkDatabricksError>
>({ value: true });
