import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendInteractFailedError = {
  code: 'BACKEND_INTERACT_FAILED';
};

export let zBackendInteractFailedError = z.object({
  code: z.literal('BACKEND_INTERACT_FAILED')
});

assertTypesEqual<
  BackendInteractFailedError,
  z.infer<typeof zBackendInteractFailedError>
>({ value: true });
