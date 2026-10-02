import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionNotFoundError = {
  code: 'BACKEND_SESSION_NOT_FOUND';
};

export let zBackendSessionNotFoundError = z.object({
  code: z.literal('BACKEND_SESSION_NOT_FOUND')
});

assertTypesEqual<
  BackendSessionNotFoundError,
  z.infer<typeof zBackendSessionNotFoundError>
>({ value: true });
