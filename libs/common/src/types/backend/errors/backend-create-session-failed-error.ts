import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendCreateSessionFailedError = {
  code: 'BACKEND_CREATE_SESSION_FAILED';
};

export let zBackendCreateSessionFailedError = z.object({
  code: z.literal('BACKEND_CREATE_SESSION_FAILED')
});

assertTypesEqual<
  BackendCreateSessionFailedError,
  z.infer<typeof zBackendCreateSessionFailedError>
>({ value: true });
