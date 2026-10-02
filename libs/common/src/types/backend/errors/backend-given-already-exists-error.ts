import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendGivenAlreadyExistsError = {
  code: 'BACKEND_GIVEN_ALREADY_EXISTS';
};

export let zBackendGivenAlreadyExistsError = z.object({
  code: z.literal('BACKEND_GIVEN_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendGivenAlreadyExistsError,
  z.infer<typeof zBackendGivenAlreadyExistsError>
>({ value: true });
