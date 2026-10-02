import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendInteractTimeoutError = {
  code: 'BACKEND_INTERACT_TIMEOUT';
};

export let zBackendInteractTimeoutError = z.object({
  code: z.literal('BACKEND_INTERACT_TIMEOUT')
});

assertTypesEqual<
  BackendInteractTimeoutError,
  z.infer<typeof zBackendInteractTimeoutError>
>({ value: true });
