import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRolesDoNotExistError = {
  code: 'BACKEND_ROLES_DO_NOT_EXIST';
  displayData?: { roles: string[] };
};

export let zBackendRolesDoNotExistError = z.object({
  code: z.literal('BACKEND_ROLES_DO_NOT_EXIST'),
  displayData: z.object({ roles: z.array(z.string()) }).nullish()
});

assertTypesEqual<
  BackendRolesDoNotExistError,
  z.infer<typeof zBackendRolesDoNotExistError>
>({ value: true });
