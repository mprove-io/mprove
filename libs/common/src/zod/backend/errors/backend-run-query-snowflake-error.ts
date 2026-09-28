import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRunQuerySnowflakeError = {
  code: 'BACKEND_RUN_QUERY_SNOWFLAKE_ERROR';
};

export let zBackendRunQuerySnowflakeError = z.object({
  code: z.literal('BACKEND_RUN_QUERY_SNOWFLAKE_ERROR')
});

assertTypesEqual<
  BackendRunQuerySnowflakeError,
  z.infer<typeof zBackendRunQuerySnowflakeError>
>({ value: true });
