import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRoleGivenAlreadyExistsError = {
  code: 'BACKEND_ROLE_GIVEN_ALREADY_EXISTS';
};

export let zBackendRoleGivenAlreadyExistsError = z.object({
  code: z.literal('BACKEND_ROLE_GIVEN_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendRoleGivenAlreadyExistsError,
  z.infer<typeof zBackendRoleGivenAlreadyExistsError>
>({ value: true });
