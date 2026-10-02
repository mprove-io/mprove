import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUserAlreadyRegisteredError = {
  code: 'BACKEND_USER_ALREADY_REGISTERED';
};

export let zBackendUserAlreadyRegisteredError = z.object({
  code: z.literal('BACKEND_USER_ALREADY_REGISTERED')
});

assertTypesEqual<
  BackendUserAlreadyRegisteredError,
  z.infer<typeof zBackendUserAlreadyRegisteredError>
>({ value: true });
