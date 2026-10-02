import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRunQueryPostgresError = {
  code: 'BACKEND_RUN_QUERY_POSTGRES_ERROR';
};

export let zBackendRunQueryPostgresError = z.object({
  code: z.literal('BACKEND_RUN_QUERY_POSTGRES_ERROR')
});

assertTypesEqual<
  BackendRunQueryPostgresError,
  z.infer<typeof zBackendRunQueryPostgresError>
>({ value: true });
