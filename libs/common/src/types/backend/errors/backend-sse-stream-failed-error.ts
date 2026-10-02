import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSseStreamFailedError = {
  code: 'BACKEND_SSE_STREAM_FAILED';
};

export let zBackendSseStreamFailedError = z.object({
  code: z.literal('BACKEND_SSE_STREAM_FAILED')
});

assertTypesEqual<
  BackendSseStreamFailedError,
  z.infer<typeof zBackendSseStreamFailedError>
>({ value: true });
