import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRoleDoesNotExistError = {
  code: 'BACKEND_ROLE_DOES_NOT_EXIST';
};

export let zBackendRoleDoesNotExistError = z.object({
  code: z.literal('BACKEND_ROLE_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendRoleDoesNotExistError,
  z.infer<typeof zBackendRoleDoesNotExistError>
>({ value: true });
