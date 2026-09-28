import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRunQueryDatabricksError = {
  code: 'BACKEND_RUN_QUERY_DATABRICKS_ERROR';
};

export let zBackendRunQueryDatabricksError = z.object({
  code: z.literal('BACKEND_RUN_QUERY_DATABRICKS_ERROR')
});

assertTypesEqual<
  BackendRunQueryDatabricksError,
  z.infer<typeof zBackendRunQueryDatabricksError>
>({ value: true });
