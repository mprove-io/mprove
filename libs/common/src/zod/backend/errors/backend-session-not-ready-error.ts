import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionNotReadyError = {
  code: 'BACKEND_SESSION_NOT_READY';
};

export let zBackendSessionNotReadyError = z.object({
  code: z.literal('BACKEND_SESSION_NOT_READY')
});

assertTypesEqual<
  BackendSessionNotReadyError,
  z.infer<typeof zBackendSessionNotReadyError>
>({ value: true });
