import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendOnlyOrgOwnerCanAccessError = {
  code: 'BACKEND_ONLY_ORG_OWNER_CAN_ACCESS';
};

export let zBackendOnlyOrgOwnerCanAccessError = z.object({
  code: z.literal('BACKEND_ONLY_ORG_OWNER_CAN_ACCESS')
});

assertTypesEqual<
  BackendOnlyOrgOwnerCanAccessError,
  z.infer<typeof zBackendOnlyOrgOwnerCanAccessError>
>({ value: true });
