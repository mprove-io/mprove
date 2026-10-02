import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUserIsOrgOwnerError = {
  code: 'BACKEND_USER_IS_ORG_OWNER';
  displayData?: { orgIds: string[] };
};

export let zBackendUserIsOrgOwnerError = z.object({
  code: z.literal('BACKEND_USER_IS_ORG_OWNER'),
  displayData: z.object({ orgIds: z.array(z.string()) }).nullish()
});

assertTypesEqual<
  BackendUserIsOrgOwnerError,
  z.infer<typeof zBackendUserIsOrgOwnerError>
>({ value: true });
