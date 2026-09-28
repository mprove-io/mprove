import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRestrictedOrganizationError = {
  code: 'BACKEND_RESTRICTED_ORGANIZATION';
};

export let zBackendRestrictedOrganizationError = z.object({
  code: z.literal('BACKEND_RESTRICTED_ORGANIZATION')
});

assertTypesEqual<
  BackendRestrictedOrganizationError,
  z.infer<typeof zBackendRestrictedOrganizationError>
>({ value: true });
