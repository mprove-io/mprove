import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUserIsTheOnlyProjectAdminError = {
  code: 'BACKEND_USER_IS_THE_ONLY_PROJECT_ADMIN';
  displayData?: { projectIds: string[] };
};

export let zBackendUserIsTheOnlyProjectAdminError = z.object({
  code: z.literal('BACKEND_USER_IS_THE_ONLY_PROJECT_ADMIN'),
  displayData: z.object({ projectIds: z.array(z.string()) }).nullish()
});

assertTypesEqual<
  BackendUserIsTheOnlyProjectAdminError,
  z.infer<typeof zBackendUserIsTheOnlyProjectAdminError>
>({ value: true });
