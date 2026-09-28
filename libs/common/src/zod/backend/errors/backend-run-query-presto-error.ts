import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRunQueryPrestoError = {
  code: 'BACKEND_RUN_QUERY_PRESTO_ERROR';
};

export let zBackendRunQueryPrestoError = z.object({
  code: z.literal('BACKEND_RUN_QUERY_PRESTO_ERROR')
});

assertTypesEqual<
  BackendRunQueryPrestoError,
  z.infer<typeof zBackendRunQueryPrestoError>
>({ value: true });
