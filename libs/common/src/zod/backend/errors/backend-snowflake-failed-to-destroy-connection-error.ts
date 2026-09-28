import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSnowflakeFailedToDestroyConnectionError = {
  code: 'BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION';
};

export let zBackendSnowflakeFailedToDestroyConnectionError = z.object({
  code: z.literal('BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION')
});

assertTypesEqual<
  BackendSnowflakeFailedToDestroyConnectionError,
  z.infer<typeof zBackendSnowflakeFailedToDestroyConnectionError>
>({ value: true });
