import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRoleGivenDoesNotExistError = {
  code: 'BACKEND_ROLE_GIVEN_DOES_NOT_EXIST';
};

export let zBackendRoleGivenDoesNotExistError = z.object({
  code: z.literal('BACKEND_ROLE_GIVEN_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendRoleGivenDoesNotExistError,
  z.infer<typeof zBackendRoleGivenDoesNotExistError>
>({ value: true });
