import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRestrictedProjectError = {
  code: 'BACKEND_RESTRICTED_PROJECT';
};

export let zBackendRestrictedProjectError = z.object({
  code: z.literal('BACKEND_RESTRICTED_PROJECT')
});

assertTypesEqual<
  BackendRestrictedProjectError,
  z.infer<typeof zBackendRestrictedProjectError>
>({ value: true });
