import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFetchFkSnowflakeError = {
  code: 'BACKEND_FETCH_FK_SNOWFLAKE_ERROR';
};

export let zBackendFetchFkSnowflakeError = z.object({
  code: z.literal('BACKEND_FETCH_FK_SNOWFLAKE_ERROR')
});

assertTypesEqual<
  BackendFetchFkSnowflakeError,
  z.infer<typeof zBackendFetchFkSnowflakeError>
>({ value: true });
