import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRestrictedOrganizationNameError = {
  code: 'BACKEND_RESTRICTED_ORGANIZATION_NAME';
};

export let zBackendRestrictedOrganizationNameError = z.object({
  code: z.literal('BACKEND_RESTRICTED_ORGANIZATION_NAME')
});

assertTypesEqual<
  BackendRestrictedOrganizationNameError,
  z.infer<typeof zBackendRestrictedOrganizationNameError>
>({ value: true });
