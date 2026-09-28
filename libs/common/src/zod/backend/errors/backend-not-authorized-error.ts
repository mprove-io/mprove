import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendNotAuthorizedError = {
  code: 'BACKEND_NOT_AUTHORIZED';
};

export let zBackendNotAuthorizedError = z.object({
  code: z.literal('BACKEND_NOT_AUTHORIZED')
});

assertTypesEqual<
  BackendNotAuthorizedError,
  z.infer<typeof zBackendNotAuthorizedError>
>({ value: true });
