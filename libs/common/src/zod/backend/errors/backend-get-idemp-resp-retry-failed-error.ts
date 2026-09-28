import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendGetIdempRespRetryFailedError = {
  code: 'BACKEND_GET_IDEMP_RESP_RETRY_FAILED';
};

export let zBackendGetIdempRespRetryFailedError = z.object({
  code: z.literal('BACKEND_GET_IDEMP_RESP_RETRY_FAILED')
});

assertTypesEqual<
  BackendGetIdempRespRetryFailedError,
  z.infer<typeof zBackendGetIdempRespRetryFailedError>
>({ value: true });
