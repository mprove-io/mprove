import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendGetIdempRespRetryError = {
  code: 'BACKEND_GET_IDEMP_RESP_RETRY';
};

export let zBackendGetIdempRespRetryError = z.object({
  code: z.literal('BACKEND_GET_IDEMP_RESP_RETRY')
});

assertTypesEqual<
  BackendGetIdempRespRetryError,
  z.infer<typeof zBackendGetIdempRespRetryError>
>({ value: true });
