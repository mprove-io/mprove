import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchConstraintsSnowflakeError = {
  code: 'BACKEND_FETCH_CONSTRAINTS_SNOWFLAKE_ERROR';
};

export let zBackendFetchConstraintsSnowflakeError = z.object({
  code: z.literal('BACKEND_FETCH_CONSTRAINTS_SNOWFLAKE_ERROR')
});

assertTypesEqual<
  BackendFetchConstraintsSnowflakeError,
  z.infer<typeof zBackendFetchConstraintsSnowflakeError>
>({ value: true });
