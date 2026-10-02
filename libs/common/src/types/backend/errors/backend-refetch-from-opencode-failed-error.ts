import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRefetchFromOpencodeFailedError = {
  code: 'BACKEND_REFETCH_FROM_OPENCODE_FAILED';
};

export let zBackendRefetchFromOpencodeFailedError = z.object({
  code: z.literal('BACKEND_REFETCH_FROM_OPENCODE_FAILED')
});

assertTypesEqual<
  BackendRefetchFromOpencodeFailedError,
  z.infer<typeof zBackendRefetchFromOpencodeFailedError>
>({ value: true });
