import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDatabricksFailedToCloseConnectionError = {
  code: 'BACKEND_DATABRICKS_FAILED_TO_CLOSE_CONNECTION';
};

export let zBackendDatabricksFailedToCloseConnectionError = z.object({
  code: z.literal('BACKEND_DATABRICKS_FAILED_TO_CLOSE_CONNECTION')
});

assertTypesEqual<
  BackendDatabricksFailedToCloseConnectionError,
  z.infer<typeof zBackendDatabricksFailedToCloseConnectionError>
>({ value: true });
