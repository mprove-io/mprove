import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionIsInErrorStateError = {
  code: 'BACKEND_SESSION_IS_IN_ERROR_STATE';
};

export let zBackendSessionIsInErrorStateError = z.object({
  code: z.literal('BACKEND_SESSION_IS_IN_ERROR_STATE')
});

assertTypesEqual<
  BackendSessionIsInErrorStateError,
  z.infer<typeof zBackendSessionIsInErrorStateError>
>({ value: true });
