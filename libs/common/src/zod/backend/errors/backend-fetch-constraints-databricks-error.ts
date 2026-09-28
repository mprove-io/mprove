import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchConstraintsDatabricksError = {
  code: 'BACKEND_FETCH_CONSTRAINTS_DATABRICKS_ERROR';
};

export let zBackendFetchConstraintsDatabricksError = z.object({
  code: z.literal('BACKEND_FETCH_CONSTRAINTS_DATABRICKS_ERROR')
});

assertTypesEqual<
  BackendFetchConstraintsDatabricksError,
  z.infer<typeof zBackendFetchConstraintsDatabricksError>
>({ value: true });
