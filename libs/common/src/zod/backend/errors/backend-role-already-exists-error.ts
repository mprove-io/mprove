import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRoleAlreadyExistsError = {
  code: 'BACKEND_ROLE_ALREADY_EXISTS';
};

export let zBackendRoleAlreadyExistsError = z.object({
  code: z.literal('BACKEND_ROLE_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendRoleAlreadyExistsError,
  z.infer<typeof zBackendRoleAlreadyExistsError>
>({ value: true });
